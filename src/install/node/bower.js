

/*
# Bower Dependencies
if [ -f bower.json ]
then
  if ! [ $(which bower) ]
  then
    if [ -f yarn.lock ]
    then
      echo "Installing bower with Yarn"
      yarn add bower
    else
      echo "Installing bower with NPM"
      npm install bower
    fi
    export PATH=$(npm bin):$PATH
  fi
  restore_cwd_cache bower_components "bower components"
  echo "Installing bower components"
  if bower install --config.interactive=false
  then
    echo "Bower components installed"
  else
    echo "Error installing bower components"
    exit 1
  fi
fi
 */
