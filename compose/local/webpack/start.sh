#!/bin/sh

set -o errexit
set -o pipefail
set -o nounset
set -o xtrace

cd /app
yarn install
cmd="$@"

if [ ! "$cmd" ]; then
    yarn dev
else
    exec $cmd
fi
