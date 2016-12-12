FROM node:6.9-slim
ENTRYPOINT []
COPY package.json .
COPY sampleresponse.json .
COPY funker-node funker-node
RUN npm i

COPY index.js .
COPY postHandler.js .
COPY services.json .
COPY serviceRepo.js .

EXPOSE 3000
CMD ["npm", "start"]
