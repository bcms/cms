FROM node:20-slim

WORKDIR /app

COPY . /app

RUN npm i && cd sdk && npm i

ENTRYPOINT ["npm", "run", "dev"]
