FROM node:16-slim

WORKDIR /app

COPY . /app

RUN npm i

ENTRYPOINT [ "npm", "run", "dev" ]
