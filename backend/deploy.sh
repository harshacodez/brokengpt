#!/bin/bash

source .env

# 1. Build the new container
sudo docker build -t projectred .

# 2. Stop and remove the existing container (if any)
CONTAINER_ID=$(sudo docker ps -aqf "name=projectred")
if [ ! -z "$CONTAINER_ID" ]; then
    sudo docker stop $CONTAINER_ID
    sudo docker rm $CONTAINER_ID
fi

# 3. Run the new container
CONTAINER_ID=$(sudo docker run -d --name projectred -p 80:5000 -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION=us-east-1 -e AWS_DEFAULT_OUTPUT=None projectred)

# 4. Prune the old unused images
sudo docker image prune -f
