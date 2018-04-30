#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset


celery -A histonets.taskapp worker $CELERY_WORKER_OPTIONS -l INFO || true
echo "Exiting..."
