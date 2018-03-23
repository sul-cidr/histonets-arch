#!/bin/bash
# Remove all docker containers, images, and orphans associated to local.yml
# --volumes can be added to also removed volumes
docker-compose -f local.yml down --rmi all --remove-orphans $@
