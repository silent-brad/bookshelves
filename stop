#!/usr/bin/env bash

# Stop the backend and proxy

echo "Stopping backend and proxy"
backend_port=8000
proxy_port=8080
nix-shell -p lsof --run "lsof -i tcp:${backend_port} | awk 'NR!=1 {print \$2}' | xargs kill; lsof -i tcp:${proxy_port} | awk 'NR!=1 {print \$2}' | xargs kill"
