"use strict"

let request = require('request');
let funker = require('./funker-node');

let express = require('express');
let bodyparser=require('body-parser');
let app = express();
app.use(bodyparser.json({strict:false}));

let sample = require('./sampleresponse.json')

app.post("/", (req,res) => {
  console.log("Id " + req.body.session.application.applicationId);

  if(req.body.session.application.applicationId == "amzn1.ask.skill.72fb1025-aacc-4d05-a582-21344940c023") {
    console.log("Intent " + req.body.request.intent.name);
    let func = req.body.request.intent.name;
    funker.call(func, req.body, (err, funcresult) => {
      res.json(funcresult);
    });
  } else {
     console.log(req.headers);
     console.log(req.body);
     res.json(sample);
  }
});

app.listen(3000, () => {
  console.log("Running..");

});

/*

{
  "version": "string",
  "session": {
    "new": true,
    "sessionId": "string",
    "application": {
      "applicationId": "string"
    },
    "attributes": {
      "string": {}
    },
    "user": {
      "userId": "string",
      "accessToken": "string"
    }
  },
  "context": {
    "System": {
      "application": {
        "applicationId": "string"
      },
      "user": {
        "userId": "string",
        "accessToken": "string"
      },
      "device": {
        "supportedInterfaces": {
          "AudioPlayer": {}
        }
      }
    },
    "AudioPlayer": {
      "token": "string",
      "offsetInMilliseconds": 0,
      "playerActivity": "string"
    }
  },
  "request": {}
}


*/

/*
{
  "session": {
    "sessionId": "SessionId.538d970d-edc5-40bb-ae0c-ca978468058b",
    "application": {
      "applicationId": "amzn1.ask.skill.b32fb0db-f0f0-4e64-b862-48e506f4ea68"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AEUHSFGVXWOYRSM2A7SVAK47L3I44TVOG6DBCTY2ACYSCUYQ65MWDZLUBZHLDD3XEMCYRLS4VSA54PQ7QBQW6FZLRJSMP5BOZE2B52YURUOSNOWORL44QGYDRXR3H7A7Y33OP3XKMUSJXIAFH7T2ZA6EQBLYRD34BPLTJXE3PDZE3V4YNFYUECXQNNH4TRG3ZBOYH2BF4BTKIIQ"
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.4b263cd6-3c8d-4455-a914-062b91dd994b",
    "locale": "en-GB",
    "timestamp": "2016-12-07T15:13:25Z",
    "intent": {
      "name": "ChangeColorIntent",
      "slots": {
        "LedColor": {
          "name": "LedColor",
          "value": "blue"
        }
      }
    }
  },
  "version": "1.0"
}

*/

