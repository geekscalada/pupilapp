#!/bin/bash

# sudo mkdir pupila

# chmod 777 pupila

# cd pupila

# git clone git@github.com:geekscalada/pupila.git .

# cd ./pupila

# sudo chmod 777 . -R

# sudo rm ./pupila/dataJson/partidos.json
# sudo touch ./pupila/dataJson/partidos.json
# sudo chmod 777 ./pupila/dataJson/partidos.json

# sudo rm ./nightwatch_scrapMatchID/launchTestLog.log
# sudo touch ./nightwatch_scrapMatchID/launchTestLog.log
# sudo chmod 777 ./nightwatch_scrapMatchID/launchTestLog.log


# cd pupila
sudo chmod 777 . -R

cd ./pupila 

sudo docker build -t pupila:0.1 .

cd ../nightwatch_scrapMatchID

sudo docker build -t nightwatch:0.1 .

sudo docker-compose -f ../docker/docker-compose.yaml up -d

cd ../pupila
sudo chmod 777 . -R


#echo "* * * * * root docker exec nightwatch bash /volume/launchTest.sh" >> /etc/crontab

sudo docker restart pupila