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

let getDocker = () => {
    var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
    var stats = fs.statSync(socket);

    if (!stats.isSocket()) {
        throw new Error('Are you sure the docker is running?');
    }
    var docker = new Docker({ socketPath: socket });
    return docker;
}

let Services = require ("./serviceRepo");
let PostHandler = require('./postHandler');

let docker = getDocker();
let postHandler = new PostHandler({"docker": docker, "funker": funker, "services": new Services()})

let find = (name, cb) => {
    docker.listServices({
        filters: { },
        all: true
    }, function(err, containers) {
        let match=[];
        containers.forEach((container) => {
           if(container.Spec.Name.indexOf(name) > -1) {
               match.push(
                {
                    "Name": container.Spec.Name, 
                    "CreatedAt": container.CreatedAt, 
                    "Mode": container.Spec.Mode,
                    "Image": container.Spec.TaskTemplate.ContainerSpec.Image
                });
           } 
        });
        cb(err, match);
    });
}

app.get("/intents/", (req, res) => {
    find("Intent", (err, containers)=> {
        res.json({"AvailableIntents": containers}); 
    });
})

app.post("/", postHandler.createHandler());

app.listen(port, () => {
    console.log("Running API gateway on port: " + port);
});
