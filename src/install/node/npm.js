

/*
# NPM Dependencies
: ${YARN_VERSION="$defaultYarnVersion"}

if [ -f package.json ]
then
  restore_cwd_cache node_modules "node modules"
  if [ -f yarn.lock ]
  then
    run_yarn $YARN_VERSION
  else
    run_npm
  fi
fi
 */
