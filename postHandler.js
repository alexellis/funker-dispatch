'use strict'

class PostHandler {
    constructor(deps) {
        this.docker = deps.docker;
        this.funker = deps.funker;
        this.services = deps.services;

        let authorizedApplicationId = process.env.authorizedApplicationId || "amzn1.ask.skill.72fb1025-aacc-4d05-a582-21344940c023";
        this.authorizedApplicationId = authorizedApplicationId;
    }

    createHandler() { 
        let handler = (req, res) => {

            console.log(req.headers);
            if(!req.body) {
                return res.status(400).send("Body is required.");
            }

            var serviceType; 
            if(req.body.ref && req.body.commits) {
                serviceType = "github";
            } else if(req.body.session && req.body.request) {
                serviceType = "alexa";
            } else {
                return res.status(400).send("Unknown request.");
            }

            /*
                Experimental code - defining services in .JSON file and doing fuzzy match at request time
                for routing to appropriate service / function. 
            */
            this.services.read((err, serviceList) => {
                if(serviceType == "github") {
                    var service = null;
                    for(let i = 0; i < serviceList.services.length; i++) {

                        if(serviceList.services[i].type == serviceType) {
                            service = serviceList.services[i];
                            break;
                        }
                    }

                    return this._dispatchJson(req.body, res, service.service);
                }
                else if (serviceType == "alexa") {
                    if (!(req.body.session && req.body.session.application)) {
                        return res.status(400).send("Invalid Alexa SDK request.");
                    }

                    console.log("Alexa request from: " + req.body.session.application.applicationId);

                    if (req.body.session.application.applicationId != this.authorizedApplicationId) {
                        return res.status(401).send("The applicationId in your request is not authorized for this API gateway.");
                    }

                    if (!(req.body.request && req.body.request.intent && req.body.request.intent)) {
                        return res.status(400).send("Supply valid Alexa SDK JSON request including an intent.");
                    }
                    let intentName = req.body.request.intent;

                    var service = null;
                    for(let i = 0; i < serviceList.services.length; i++) {
                        if(serviceList.services[i].type == serviceType && 
                            intentName == serviceList.services[i].service) {
                            service = serviceList.services[i];
                            break;
                        }
                    }
                    return this._dispatchAlexa(req.body, res);
                }
            });
        };
        return handler;
    }

    _find (name, cb) {
        this.docker.listServices({
            filters: { "name": [name] },
            all: true
        }, function(err, containers) {
            cb(containers.length || 0);
        });
    }

    _dispatchJson (body, res, serviceName) {
        console.log("Dispatching JSON to: ", serviceName);
        this._find(serviceName, (serviceCount) => {
            if (serviceCount > 0) {
                this.funker.call(serviceName, body, (err, funcresult) => {
                    if(err) {
                        console.error("Error from funker.call: ", err);
                        return res.status(500).json(err);
                    }

                    try {
                        res.json(funcresult);
                    } catch(e) {
                        console.error("Error parsing funker.call response: ", e);
                        return res.status(500).json(e);
                    }
                });
            } else {
                return res.status(500).send("The function is not currently defined or started as a Docker service in the Swarm.");
            }
        });
    }

    _dispatchAlexa (body, res) {
        console.log("Intent " + body.request.intent.name);
        let serviceName = body.request.intent.name;
        this._find(serviceName, (serviceCount) => {
            if (serviceCount > 0) {
                this.funker.call(serviceName, body, (err, funcresult) => {
                    if(err) {
                        console.error("Error from funker.call: ", err);
                        return res.status(500).json(err);
                    }

                    try {
                        res.json(funcresult);
                    } catch(e) {
                        console.error("Error parsing funker.call response: ", e);
                        return res.status(500).json(e);
                    }
                });
            } else {
                return res.status(500).send("The function is not currently defined or started as a Docker service in the Swarm.");
            }
        });
    }
}

module.exports = PostHandler;
