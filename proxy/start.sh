#!/usr/bin/env bash

# Starts the reverse proxy
set -a
source .env
set +a

cd proxy

sed -e "s|\$PROXY_PORT|$PROXY_PORT|g" -e "s|\$SERVER_PORT|$SERVER_PORT|g" -e "s|\$FRONTEND_PATH|$FRONTEND_PATH|g" Caddyfile.template >Caddyfile

caddy run --config ./Caddyfile
