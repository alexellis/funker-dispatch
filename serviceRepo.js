'use strict'

var fs = require('fs');

module.exports = class ServiceRepo {
    read(cb) {
        fs.readFile("./services.json", "utf8", (err, data) => {
            let parsed = JSON.parse(data);
            cb(err, parsed);
        });
    }

}
