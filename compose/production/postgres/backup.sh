#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

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

# we might run into trouble when using the default `postgres` user, e.g. when dropping the postgres
# database in restore.sh. Check that something else is used here
if [ "$POSTGRES_USER" == "postgres" ]
then
    echo "creating a backup as the postgres user is not supported, make sure to set the POSTGRES_USER environment variable"
    exit 1
fi

# export the postgres password so that subsequent commands don't ask for it
export PGPASSWORD=$POSTGRES_PASSWORD

echo "creating backup"
echo "---------------"

FILENAME=backup_$(date +'%Y_%m_%dT%H_%M_%S').sql.gz
pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER | gzip > /backups/$FILENAME

echo "successfully created backup $FILENAME"
