#!/bin/sh

set -o errexit
set -o pipefail
set -o nounset


celery -A histonets.taskapp beat -l INFO
