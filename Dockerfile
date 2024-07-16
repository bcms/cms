FROM node:20-slim

WORKDIR /app

COPY . /app

# Install required system packages
RUN apt update && apt install ffmpeg zip unzip -y
# Install dependencies
RUN npm i
# Prepare backend code
RUN npm run build:backend
# Build and prepare UI code
RUN cd ui && npm run build

# CLEANUP
RUN cd ui && rm -rf node_modeuls && cd ../.. && rm -rf node_modeuls

WORKDIR /app/backend

ENTRYPOINT ["npm", "run", "start"]
