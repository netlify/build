
/*
# PIP dependencies
if [ -f requirements.txt ]
then
  echo "Installing pip dependencies"
  restore_home_cache ".cache" "pip cache"
  if pip install -r requirements.txt
  then
    echo "Pip dependencies installed"
  else
    echo "Error installing pip dependencies"
    exit 1
  fi
elif [ -f Pipfile ]
then
  echo "Installing dependencies from Pipfile"
  if $HOME/python$PIPENV_RUNTIME/bin/pipenv install
  then
    echo "Pipenv dependencies installed"
    if source $($HOME/python$PIPENV_RUNTIME/bin/pipenv --venv)/bin/activate
    then
      echo "Python version set to $(python -V)"
    else
      echo "Error activating Pipenv environment"
      exit 1
    fi
  else
    echo "Error installing Pipenv dependencies"
    echo "Please see https://github.com/netlify/build-image/#included-software for current versions"
    exit 1
  fi
fi
 */
