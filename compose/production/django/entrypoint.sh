#!/bin/bash
set -euxo pipefail


cmd="$@"

if [ -z "${POSTGRES_USER:-}" ]; then
    # the official postgres image uses 'postgres' as default user if not set explictly.
    export POSTGRES_USER=postgres
fi
if [ -z "${POSTGRES_HOST:-}" ]; then
    export POSTGRES_HOST=postgres
fi
if [ -z "${POSTGRES_PORT:-}" ]; then
    export POSTGRES_PORT=5432
fi
export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

postgres_ready() {
python << END
import sys

import psycopg2

try:
    psycopg2.connect(
        dbname="${POSTGRES_DB}",
        user="${POSTGRES_USER}",
        password="${POSTGRES_PASSWORD}",
        host="${POSTGRES_HOST}",
        port=int("${POSTGRES_PORT}")
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)

END
}

until postgres_ready; do
  >&2 echo 'PostgreSQL is unavailable (sleeping)...'
  sleep 1
done

>&2 echo 'PostgreSQL is up - continuing...'

exec $cmd
