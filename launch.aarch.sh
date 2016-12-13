#!/bin/bash

docker build -t funker-dispatch . -f Dockerfile.aarch64 && docker rm -f funker-dispatch; docker run -v /var/run/docker.sock:/var/run/docker.sock -d --restart=always --net=funker -p 80:3000 --name funker-dispatch funker-dispatch ; docker logs -f funker-dispatch

