FROM node:14-slim

WORKDIR /app

COPY . /app

RUN npm i

ENTRYPOINT [ "npm", "run", "dev" ]
