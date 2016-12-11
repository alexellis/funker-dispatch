"use strict"

let request = require('request');
let funker = require('./funker-node');
var Docker = require('dockerode');
var fs = require('fs');

let express = require('express');
let bodyparser = require('body-parser');
let app = express();
app.use(bodyparser.json({ strict: false }));

let port = process.env.port || 3000;
let authorizedApplicationId = process.env.authorizedApplicationId || "amzn1.ask.skill.72fb1025-aacc-4d05-a582-21344940c023";

let getDocker = () => {
    var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
    var stats = fs.statSync(socket);

    if (!stats.isSocket()) {
        throw new Error('Are you sure the docker is running?');
    }
    var docker = new Docker({ socketPath: socket });
    return docker;
}

app.post("/", (req, res) => {
    if (!(req.body && req.body.session && req.body.session.application)) {
        return res.status(400).send("Invalid Alexa SDK request.");
    }

    console.log("Alexa request from: " + req.body.session.application.applicationId);

    if (req.body.session.application.applicationId != authorizedApplicationId) {
        return res.status(401).send("The applicationId in your request is not authorized for this API gateway.");
    }

    if (!(req.body.request && req.body.request.intent && req.body.request.intent)) {
        return res.status(400).send("Supply valid Alexa SDK JSON request including an intent.");
    }
    dispatch(req.body, res);
});

let find = (name, cb) => {
    docker.listServices({
        filters: { "name": [name] },
        all: true
    }, function(err, containers) {
        cb(containers.length || 0);
    });
};

let dispatch = (body, res) => {
    console.log("Intent " + body.request.intent.name);
    let serviceName = body.request.intent.name;
    find(serviceName, (serviceCount) => {
        if (serviceCount > 0) {
            funker.call(serviceName, body, (err, funcresult) => {
                res.json(funcresult);
            });
        } else {
            return res.status(500).send("The function is not currently defined or started as a Docker service in the Swarm.");
        }
    });
};

let docker = getDocker();

app.listen(port, () => {
    console.log("Running API gateway on port: " + port);
});
