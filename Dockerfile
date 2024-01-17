FROM node:latest

WORKDIR /scooter-app

COPY dist/ ./dist/
COPY package*.json ./
COPY scooter-trips.log ./
COPY env/ ./env/

EXPOSE 1337

RUN npm install

ENTRYPOINT [ "node", "/scooter-app/dist/index.js" ]