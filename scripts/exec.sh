#!/bin/bash
# Run commands in a specific running container
docker-compose -f local.yml exec $@
