#!/usr/bin/env bash

# Build the app with Nix
nix build

# Start the reverse proxy
./result/bin/start-proxy &

# Start the backend (this also creates the database in the roor dir of this project)
./result/bin/app &
