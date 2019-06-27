# Node web app

## Build image 

`docker build -t zatamine/node-web-app .`


## Run the image

`docker run --name=node_web_app -p 3000:3000 -d zatamine/node-web-app`


## Enter the container

`docker ps`

`docker exec -it node_web_app /bin/sh`


## Test

`curl -i localhost:3000`