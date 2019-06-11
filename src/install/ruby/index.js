

module.exports = async function installRuby(cwd, cacheDir) {

}

/*
# Ruby version
local tmprv="${RUBY_VERSION:=$defaultRubyVersion}"
source $HOME/.rvm/scripts/rvm
# rvm will overwrite RUBY_VERSION, so we must control it
export RUBY_VERSION=$tmprv

local druby=$RUBY_VERSION
if [ -f .ruby-version ]
then
  druby=$(cat .ruby-version)
  echo "Attempting ruby version ${druby}, read from .ruby-version file"
else
  echo "Attempting ruby version ${druby}, read from environment"
fi

rvm use ${druby} > /dev/null 2>&1
export CUSTOM_RUBY=$?
local rvs=($(rvm list strings))

local fulldruby="ruby-${druby}"
if [ -d $NETLIFY_CACHE_DIR/ruby_version/${fulldruby} ]
then
  echo "Started restoring cached ruby version"
  rm -rf $RVM_DIR/rubies/${fulldruby}
  cp -p -r $NETLIFY_CACHE_DIR/ruby_version/${fulldruby} $RVM_DIR/rubies/
  echo "Finished restoring cached ruby version"
fi

rvm --create use ${druby} > /dev/null 2>&1
if [ $? -eq 0 ]
then
  local crv=$(rvm current)
  export RUBY_VERSION=${crv#ruby-}
  echo "Using ruby version ${RUBY_VERSION}"
else
  echo -e "${YELLOW}"
  echo "** WARNING **"
  echo "Using custom ruby version ${druby}, this will slow down the build."
  echo "To ensure fast builds, set the RUBY_VERSION environment variable, or .ruby-version file, to an included ruby version."
  echo "Included versions: ${rvs[@]#ruby-}"
  echo -e "${NC}"
  if rvm_install_on_use_flag=1 rvm --quiet-curl --create use ${druby}
  then
    local crv=$(rvm current)
    export RUBY_VERSION=${crv#ruby-}
    echo "Using ruby version ${RUBY_VERSION}"
  else
    echo "Failed to install ruby version '${druby}'"
    exit 1
  fi
fi

if ! gem list -i "^bundler$" > /dev/null 2>&1
then
  if ! gem install bundler
  then
    echo "Error installing bundler"
    exit 1
  fi
fi
 */
