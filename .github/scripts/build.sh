#!/bin/bash
set -ex

cp packages/coordinator/.env.example packages/coordinator/.env

sed -i "s|^\(COORDINATOR_RPC_URL=\).*|\1$1|" packages/coordinator/.env
sed -i "s|^\(COORDINATOR_ADDRESSES=\).*|\1$2|" packages/coordinator/.env
sed -i "s|^\(COORDINATOR_ALLOWED_ORIGINS=\).*|\1$3|" packages/coordinator/.env

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com

docker build -t maci-coordinator -f packages/coordinator/apps/Dockerfile .
docker tag maci-coordinator:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/maci-coordinator:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/maci-coordinator:latest

exit 0
