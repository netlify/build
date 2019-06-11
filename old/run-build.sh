#!/bin/bash

dir="$(dirname "$0")"
build_dir="$1"
node_version="$2"
ruby_version="$3"
yarn_version="$4"
cmd="$5"
php_version="5.6"
functions_dir="$6"
zisi_temp_dir="$7"

BUILD_COMMAND_PARSER=$(cat <<EOF
$cmd
EOF
)

. "$dir/run-build-functions.sh"

cd $build_dir

: ${GO_VERSION="1.12"}

echo "Installing dependencies"
install_dependencies $node_version $ruby_version $yarn_version $php_version $GO_VERSION

echo "Installing missing commands"
install_missing_commands

echo "Verify run directory"
set_go_import_path

echo "Executing user command: $cmd"
eval "$cmd"
CODE=$?

prep_functions $functions_dir $zisi_temp_dir
cache_artifacts
report_lingering_procs

exit $CODE
