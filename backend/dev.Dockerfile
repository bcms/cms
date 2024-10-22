FROM node:20-slim

WORKDIR /app

COPY . /app/

RUN apt update
RUN apt install ffmpeg curl zip unzip curl -y
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-26.0.0.tgz \
  && tar xzvf docker-26.0.0.tgz \
  && mv docker/docker /usr/local/bin \
  && rm -r docker docker-26.0.0.tgz
RUN npm i

ENTRYPOINT ["npm", "run", "dev"]
