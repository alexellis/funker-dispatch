"use strict"

let request = require('request');
let funker = require('./funker-node');

let express = require('express');
let bodyparser = require('body-parser');
let app = express();
app.use(bodyparser.json({ strict: false }));

let sample = require('./sampleresponse.json')
let port = process.env.port || 3000;
let authorizedApplicationId = process.env.authorizedApplicationId || "amzn1.ask.skill.72fb1025-aacc-4d05-a582-21344940c023";

app.post("/", (req, res) => {
    if (req.body && req.body.session && req.body.session.application) {
        console.log("Request from Id " + req.body.session.application.applicationId);
        if (req.body.session.application.applicationId == authorizedApplicationId) {
            if (req.body.request && req.body.request.intent && req.body.request.intent) {
                console.log("Intent " + req.body.request.intent.name);
                let func = req.body.request.intent.name;
                funker.call(func, req.body, (err, funcresult) => {
                    res.json(funcresult);
                });
            } else {
                return res.status(400).send("Supply valid Alexa SDK JSON request including an intent.");
            }
        } else {
            return res.status(401).send("Your applicationId is not authorized for this API gateway.");
        }

    } else {
        return res.status(400).send("Supply valid Alexa SDK JSON");
    }
});

app.listen(port, () => {
    console.log("Running API gateway on port: " + port);
});
