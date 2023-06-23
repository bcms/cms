FROM becomes/cms-backend-base-image:2.0.0

WORKDIR /app

COPY ./lib/ /app/

RUN npm i

ENTRYPOINT ["npm", "start"]
