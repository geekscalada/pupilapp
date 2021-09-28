FROM node:14.17
ENV TZ=Europe/Madrid

RUN mkdir /app
RUN mkdir /volume
WORKDIR /app
COPY . .

RUN npm install
RUN npm install nodemon -g


#probably not necessary with docker-compose
VOLUME ["/volume"]








