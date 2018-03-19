#!/bin/sh

set -o errexit
set -o pipefail
set -o nounset
set -o xtrace

cd /app
yarn install
yarn dev
