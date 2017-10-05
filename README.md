# Docker Swarm serverless API gateway 

This project provides a PoC for serverless functions backed by Docker Swarm. This reposistory hosts an API gateway / HTTP dispatch for Amazon AWS triggers such as [Alexa SDK](https://developer.amazon.com/alexa-skills-kit), S3, DynamoDB, CloudWatch or Github webhooks.

The Amazon Alexa voice service will invoke either an [AWS Lambda](https://aws.amazon.com) function or an HTTPs endpoint. In this project we extend the [funker framework/idea](https://github.com/bfirsh/serverless-docker) to create a Docker Swarm which is capable of running our own *serverless* functions across a high-availability swarm.

Video overview & demo
=====================

Watch the high level overview of what serverless is, the aims of my PoC and for the live demo with an Echo Dot.

> * [Serverless functions in Docker on a Raspberry Pi cluster](https://www.youtube.com/watch?v=BQP67FWF1P8)

Changelog
==========

13 Jan 2017

* **This project is deprecated and development has stopped in favour of [OpenFaaS - Functions as a Service](http://github.com/openfaas/faas)**

12 Dec 2016

* Pushed remote branch [services/json](https://github.com/alexellis/funker-dispatch/tree/services_json) - looking into a manifest file for defining available functions. Includes support for Github push webhooks.

11 Dec 2016

* Default platform is now x86_64, Raspberry Pi (ARM) accessible by Dockerfile.armhf
* sample_request.json's intent matches README.md

8 Dec 2016

* Validation and override added for applicationId in JSON request
* Validation added for JSON body
* Support for Python functions with working sample
* Docker Captains handler - counts captains via HTML scrape
* Hostname handler - returns container hostname for showing round-robin from swarm
* Allow mounting of `-v /var/run/docker.sock:/var/run/docker.sock` for checking services exist and validation

Backlog
=======

* Dynamically create swarm services through remote API
* HTML tester page for API gateway with test events
* Register handlers and Intents via YAML or JSON file
* Handle Github webhooks in addition to the Alexa SDK
* Upload page for function definitions

Technical architecture:
======================

![](https://raw.githubusercontent.com/alexellis/funker-dispatch/master/alexa-funker.png)

The Alexa custom skill invokes our API gateway or HTTP dispatcher. Docker's attachable swarm network and name resolution allows us to lookup a matching Docker service by hostname. The funker-node library is then used to invoke the serverless function and collect the response which is returned to AWS. Alexa will then speak out the response.

Functions are written to implement a simple TCP socket on port 9999. The original concept for the functions was put together by [Ben F / Justin Cormack](https://github.com/bfirsh/serverless-docker) from the Docker team.

The code is written in Node.js which is cross-platform. The Dockerfiles provided have a base image designed for ARM/Raspberry Pi because I'm running this experiment on my Raspberry Pi 2 Swarm:

**See also: Getting started with Docker & Swarm on the Raspberry Pi**

* Repo for Docker on ARM (images, tutorials): [alexellis/docker-arm](https://github.com/alexellis/docker-arm/)
* [Raspberry Pi Docker Swarm deep dive](http://blog.alexellis.io/live-deep-dive-pi-swarm/)

Example of funker handler function in Node.js

* [HelloWorldIntent](https://github.com/alexellis/helloworldintent-funker)

This function finds the count of people in space by querying a remote JSON API over HTTP.

* CaptainsIntent: [Docker captains counter](https://github.com/alexellis/captains-counter-funker)

This Node.js function scrapes Docker's website and counts HTML elements to determine the number of Docker captains.

A Python version is also available: [dockercaptains-python-funker](https://github.com/alexellis/dockercaptains-python-funker)

Request validation
==================

The initial implementation has basic validation for the following:

* request matches Alexa skill JSON format
* applicationId is allowed to execute (must match index.js or environmental variable `authorizedApplicationId`)
* swarm service exists (and can be invoked)

Usage:
======

Make sure your nodes are running Docker 1.13-rc or newer. A quick upgrade can be to untar the Docker binaries from the [Releases page](https://github.com/docker/docker/releases) straight over the top of a 1.12 installation from `curl -sSL get.docker.com |sh`.

```
git clone https://github.com/alexellis/funker-dispatch
cd funker-dispatch
git clone https://github.com/alexellis/funker-node
git checkout light_weight_refactor
cd ../

docker build -t funker-dispatch .

docker network create --attachable -d overlay funker
docker run --net=funker -p 3000:3000 --name dispatch -v /var/run/docker.sock:/var/run/docker.sock funker-dispatch
```

Once your dispatch container is running head over to the HelloWorldIntent repo, build your image and create a service. If you have a mutli-node swarm, then push the container to the Hub or a registry first, for a single node just use the image name.

Once the dispatch container is running and the `HelloIntent` service has been created you can configure your Alexa Skill in the Alexa SDK console to use "HTTPs" for its invocations. An Alexa skill will not invoke a HTTP insecure endpoint, for that reason if you are tight on time then use [ngrok](https://ngrok.com) to set up a quick HTTPs gateway.

```
ngrok http 3000
```

Set up an utterance to fire off the request. I used:

**Sample Utterances:**

```
HelloIntent how many people are in space
HostnameIntent give me a hostname
CaptainsIntent find out how many docker captains there are
``` 

**Intent Schema**

```
{
  "intents": [
    {
      "intent": "HelloIntent"
    },
    {
      "intent": "CaptainsIntent"
    },
    {
      "intent": "HostnameIntent"
    }
  ]
}
```

If you not have access to an Echo / Dot `curl` will allow you to bypass the voice portion completely (just use the sample .json file in the repo).

Here's an example of invoking the (HelloIntent) with `curl`:

```
cd funker-dispatch
curl -Sv -H "Content-Type: application/json" -X POST http://localhost:3000 -d @./sample_request.json
```

You should see a response like this:

```
{"version":"1.0","response":{"outputSpeech":{"type":"PlainText","text":"There's currently 6 people in space"},"card":{"content":"There's currently 6 people in space","title":"People in space","type":"Simple"},"shouldEndSession":true},"sessionAttributes":{}}
```

* [Detailed examples of Alexa SDK JSON](https://github.com/alexellis/funker-dispatch/blob/master/ALEXA_JSON.md)

Get in touch / feedback
========================

Please get in touch on Twitter [@alexellisuk](https://twitter.com/alexellisuk)

