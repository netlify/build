

/*
# Go version
restore_home_cache ".gimme_cache" "go cache"
if [ -f .go-version ]
then
  local goVersion=$(cat .go-version)
  if [ "$installGoVersion" != "$goVersion" ]
  then
    installGoVersion="$goVersion"
  fi
fi

if [ "$GIMME_GO_VERSION" != "$installGoVersion" ]
then
  echo "Installing Go version $installGoVersion"
  GIMME_ENV_PREFIX=$HOME/.gimme_cache/env GIMME_VERSION_PREFIX=$HOME/.gimme_cache/versions gimme $installGoVersion
  if [ $? -eq 0 ]
  then
    source $HOME/.gimme_cache/env/go$installGoVersion.linux.amd64.env
  else
    echo "Failed to install Go version '$installGoVersion'"
    exit 1
  fi
else
  gimme
  if [ $? -eq 0 ]
  then
    source $HOME/.gimme/env/go$GIMME_GO_VERSION.linux.amd64.env
  else
    echo "Failed to install Go version '$GIMME_GO_VERSION'"
    exit 1
  fi
fi
 */

/*
# Setup project GOPATH
if [ -n "$GO_IMPORT_PATH" ]
then
  mkdir -p "$(dirname $GOPATH/src/$GO_IMPORT_PATH)"
  rm -rf $GOPATH/src/$GO_IMPORT_PATH
  ln -s /opt/buildhome/repo ${GOPATH}/src/$GO_IMPORT_PATH
fi
 */
