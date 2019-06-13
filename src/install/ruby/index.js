const path = require('path')
const execa = require('execa')
const moveCache = require('../utils/moveCache')
const shasum = require('../utils/shasum')
const shouldInstallDeps = require('../utils/shouldInstallDeps')
const { fileExists, writeFile, readFile } = require('../utils/fs')

module.exports = async function installRuby(cwd, cacheDir, version) {
  const { HOME } = process.env
  let tmpRubyVersion = version

  try {
    await execa('source', [`${HOME}/.rvm/scripts/rvm`])
  } catch (err) {
    console.log('No rvm found', err)
    process.exit(1)
  }
  // # rvm will overwrite RUBY_VERSION, so we must control it.
  process.env.RUBY_VERSION = tmpRubyVersion

  let druby = process.env.RUBY_VERSION
  const rubyVersionFile = path.join(cwd, '.ruby-version')
  if (await fileExists(rubyVersionFile)) {
    druby = await readFile(rubyVersionFile)
    console.log(`Attempting ruby version ${druby}, read from .ruby-version file`)
  } else {
    console.log(`Attempting ruby version ${druby}, read from environment`)
  }

  try {
    // TODO what is this doing?
    await execa('rvm', ['use', druby, '>', '/dev/null', '2>&1'])
  } catch (err) {
    console.log('RVM use error', err)
    process.exit(1)
  }
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
