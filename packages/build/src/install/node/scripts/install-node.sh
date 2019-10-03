#!/bin/bash

# script.sh (node_version)
node_version="$1"

# Source NVM
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

# Install a version of node
nvm install $node_version
