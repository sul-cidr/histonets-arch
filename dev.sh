#!/bin/bash
docker-compose -f local.yml up $@
docker-compose -f local.yml rm --stop --force
