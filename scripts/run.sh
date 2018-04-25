#!/bin/bash
# Run commands in a new specific container instance
docker-compose -f local.yml run $@
