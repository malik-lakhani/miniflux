#! bin/bash

export MINIFLUX_PORT=80
export POSTGRES_USER=miniflux
export POSTGRES_PASSWORD=JMLEwQHKG7
export POSTGRES_PORT=5432
export POSTGRES_DB=miniflux

if [ -z $1 ]; then
  docker-compose up -d
elif [[ $1 = "up" ]]; then
  docker-compose up --build
elif [[ $1 = "down" ]]; then
  docker-compose down
fi