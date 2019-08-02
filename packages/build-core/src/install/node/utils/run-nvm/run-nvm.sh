#!/bin/bash

# script.sh (node_version)
command="$1"

# Source NVM
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

# Run nvm command
nvm $command
