#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset
set -o xtrace

pip install redis flower
flower -A histonets.taskapp --broker $CELERY_BROKER_URL
