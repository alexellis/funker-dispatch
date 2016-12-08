# funker-dispatch

This project provides a PoC for serverless functions backed by Docker. This reposistory hosts an API gateway / HTTP dispatch for Amazon AWS triggers such as [Alexa SDK](https://developer.amazon.com/alexa-skills-kit), S3, DynamoDB and CloudWatch.

The Amazon Alexa voice service will invoke either an [AWS Lambda](https://aws.amazon.com) function or a HTTPs endpoint. In this project we extend the [funker framework/idea](https://github.com/bfirsh/serverless-docker) to create a Docker Swarm which is capable of running our own *serverless* functions across a high-availability swarm.

Video demo
==========

A video overview accompanies this demo:

> * [Serverless functions in Docker on a Raspberry Pi cluster](https://www.youtube.com/watch?v=BQP67FWF1P8)

Check out the video for a high level overview of what serverless is and the aims of this demo.

Technical architecture:
======================

![](https://raw.githubusercontent.com/alexellis/funker-dispatch/master/alexa-funker.png)

The Alexa custom skill invokes our API gateway or HTTP dispatcher. Docker's attachable swarm network and name resolution allows us to lookup a matching Docker service by hostname. The funker-node library is then used to invoke the serverless function and collect the response which is returned to AWS. Alexa will then speak out the response.

Functions are written to implement a simple TCP socket on port 9999. The original concept for the functions was put together by [Ben F / Justin Cormack](https://github.com/bfirsh/serverless-docker) from the Docker team.

The code is written in Node.js which is cross-platform. The Dockerfiles provided have a base image designed for ARM/Raspberry Pi because I'm running this experiment on my [Raspberry Pi 2 Swarm](https://github.com/alexellis/docker-arm/). 

> To build the Docker images for 64-bit just change the base image to a 64-bit Node image such as `node:6.9-slim`

Example of funker handler function in Node.js

* [HelloWorldIntent](https://github.com/alexellis/helloworldintent-funker)

This function finds the count of people in space by querying a remote JSON API over HTTP.

Usage:
======

```
git clone https://github.com/alexellis/funker-dispatch
cd funker-dispatch
git clone https://github.com/alexellis/funker-node
docker build -t funker-dispatch .

docker network create --attachable -d overlay funker
docker run --net=funker -p 3000:3000 --name dispatch funker-dispatch
```

Sample JSON from Alexa Skills kit:
=================================

More on the Alexa Skills kit: https://developer.amazon.com/alexa-skills-kit

**request**

```
{
  "session": {
    "sessionId": "SessionId.dc2657cc-90cc-4343-939d-b0baf29eb690",
    "application": {
      "applicationId": "amzn1.ask.skill.4a71a0a0-d0e6-4ca7-a99b-2715e5772755"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AEN7KA5DBXAAWQPDUXTXFWBARZ5YZ6TNOQR5CUMV5LCCJTMBZVFP45SZVLGDD5GQBOM7QMELRS7LHG3F2FN2QQQMTBURDL5I4PQ33EHMNNGO4TXWG732Y6SDM2YZKHSPWIIWBH3GSE3Q3TTFAYN2Y66RHBKRANYCNMX2WORMASUGVRHUNBB4HZMJEC7HQDWUSXAOMP77WGJU4AY"
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.d4c65242-dd10-4270-918e-59e5222f6965",
    "locale": "en-GB",
    "timestamp": "2016-12-07T15:58:14Z",
    "intent": {
      "name": "SpaceCountIntent",
      "slots": {}
    }
  },
  "version": "1.0"
}
```

**response**

```
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "There's currently 6 people in space"
    },
    "card": {
      "content": "There's currently 6 people in space",
      "title": "People in space",
      "type": "Simple"
    },
    "shouldEndSession": true
  },
  "sessionAttributes": {}
}
```
