FROM node:16-slim

WORKDIR /app

RUN apt update
RUN apt install ffmpeg -y
RUN apt install git -y
RUN apt install curl -y
RUN mkdir /root/.ssh
RUN ssh-keyscan -H github.com >> /root/.ssh/known_hosts
RUN chmod -R 755 /root/.ssh
RUN apt install zip --yes
RUN apt install unzip --yes
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-20.10.8.tgz \
  && tar xzvf docker-20.10.8.tgz \
  && mv docker/docker /usr/local/bin \
  && rm -r docker docker-20.10.8.tgz
