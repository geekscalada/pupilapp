FROM ubuntu:latest
ENV TZ=Europe/Madrid

RUN mkdir /app
RUN mkdir /volume
WORKDIR /app
COPY . .
COPY cronLaunchNW /etc/cron.d/

RUN apt-get update -y
RUN apt-get install -y apt-utils
RUN apt-get upgrade -y

RUN apt-get install cron -y
RUN apt-get install psmisc -y
RUN apt-get install wget -y
RUN apt-get install xz-utils
RUN apt-get install curl -y
RUN apt-get install nano

RUN wget https://nodejs.org/dist/v14.17.4/node-v14.17.4-linux-x64.tar.xz


RUN mkdir -p /usr/local/lib/nodejs

RUN tar -xf /app/node-v14.17.4-linux-x64.tar.xz -C /usr/local/lib/nodejs

RUN cp /usr/local/lib/nodejs/node-v14.17.4-linux-x64/bin/node /usr/bin/node


RUN curl -qL https://www.npmjs.com/install.sh | sh

RUN npm i -g nightwatch
RUN apt-get install firefox -y 
RUN npm install geckodriver


#probably not necessary with docker-compose
VOLUME ["/volume"]








