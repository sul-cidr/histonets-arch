#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset
set -o xtrace


celery -A histonets.taskapp worker -l INFO
