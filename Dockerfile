FROM node:12-slim

WORKDIR /app

COPY . /app

RUN npm i

ENTRYPOINT [ "npm", "run", "dev" ]
