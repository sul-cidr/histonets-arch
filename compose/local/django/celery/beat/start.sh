#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset
set -o xtrace


rm -f './celerybeat.pid'
celery -A histonets.taskapp beat -l INFO
