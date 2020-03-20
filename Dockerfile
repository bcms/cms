FROM node:10-slim

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
COPY src/. /app/src
COPY public/. /app/public
COPY svelte/. /app/svelte
COPY assets/. /app/assets
COPY tsconfig.json /app

RUN npm install
RUN npm run install-svelte
RUN npm run build-svelte
RUN npm run build

EXPOSE 1280

ENTRYPOINT [ "npm","run","start" ]