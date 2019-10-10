const path = require('path')

const execa = require('execa')
const del = require('del')
const pathExists = require('path-exists')

const { readFile, copyFiles } = require('../../utils/fs')
const source = require('../utils/source')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L233-L292
module.exports = async function installRuby(cwd, cacheDir, version) {
  const { HOME } = process.env

  try {
    await source(`${HOME}/.rvm/scripts/rvm`)
  } catch (err) {
    console.log('No rvm found', err)
    process.exit(1)
  }
  // # rvm will overwrite RUBY_VERSION, so we must control it.
  process.env.RUBY_VERSION = version

  let druby = process.env.RUBY_VERSION
  const rubyVersionFile = `${cwd}/.ruby-version`
  if (await pathExists(rubyVersionFile)) {
    druby = await readFile(rubyVersionFile)
    console.log(`Attempting ruby version ${druby}, read from .ruby-version file`)
  } else {
    console.log(`Attempting ruby version ${druby}, read from environment`)
  }

  let rvm = {}
  try {
    // TODO verify this works
    rvm = await execa('rvm', ['use', druby]) // what do these do? --> '>', '/dev/null', '2>&1'
  } catch (err) {
    console.log('RVM use error', err)
    process.exit(1)
  }
  if (rvm.stout) {
    process.env.CUSTOM_RUBY = rvm.stout
  }

  let rvs
  try {
    // TODO verify command
    const rvsList = await execa('rvm', ['list', 'strings'])
    rvs = rvsList.stdout
  } catch (err) {
    console.log('RVM list strings error', err)
    process.exit(1)
  }

  const fulldrubyPath = `${cacheDir}/ruby_version/ruby-${druby}`
  if (await pathExists(fulldrubyPath)) {
    console.log('Started restoring cached ruby version')
    // rm -rf $RVM_DIR/rubies/${fulldruby}
    await del(fulldrubyPath)
    // cp -p -r $NETLIFY_CACHE_DIR/ruby_version/${fulldruby} $RVM_DIR/rubies/
    await copyFiles(fulldrubyPath, path.join(process.env.$RVM_DIR, 'rubies'))
    console.log('Finished restoring cached ruby version')
  }

  let rvmCreate
  try {
    // TODO verify command
    // rvm --create use ${druby} > /dev/null 2>&1
    const rvmCreateCommand = await execa('rvm', ['--create', 'use', druby]) // ? what are these? ---> '>', '/dev/null', '2>&1'
    rvmCreate = rvmCreateCommand.stdout
  } catch (err) {
    console.log('RVM --create use error', err)
    process.exit(1)
  }

  if (rvmCreate === 0) {
    let crv = await getCurrentRubyVersion()
    // export RUBY_VERSION=${crv#ruby-}
    process.env.RUBY_VERSION = `${crv}#ruby-`
    console.log(`Using ruby version ${process.env.RUBY_VERSION}`)
  } else {
    console.log('** WARNING **')
    console.log(`Using custom ruby version ${druby}, this will slow down the build.`)
    console.log(
      'To ensure fast builds, set the RUBY_VERSION environment variable, or .ruby-version file, to an included ruby version.'
    )
    // echo "Included versions: ${rvs[@]#ruby-}"
    console.log(`Included versions: ${rvs}`)

    try {
      // @TODO verify command
      await execa('rvm', ['--quiet-curl', '--create', 'use', druby], {
        rvm_install_on_use_flag: '1'
      })
    } catch (err) {
      console.log(`Failed to install ruby version '${druby}'`, err)
      process.exit(1)
    }

    const crv = await getCurrentRubyVersion()
    process.env.RUBY_VERSION = `${crv}#ruby-`
    console.log(`Using ruby version ${process.env.RUBY_VERSION}`)
  }

  let gems
  try {
    const gemList = await execa('gem', ['list', '-i', '^bundler$']) // --> what  '>', '/dev/null', '2>&1'
    gems = gemList.stdout
  } catch (err) {
    console.log('gem list -i error', err)
    process.exit(1)
  }

  if (!gems) {
    const bundlerInstall = await execa('gem', ['install', 'bundler'])
    if (!bundlerInstall.stdout) {
      console.log('Error installing bundler')
      process.exit(1)
    }
  }
}

async function getCurrentRubyVersion() {
  let version
  try {
    const { stdout } = await execa('rvm', ['current'])
    version = stdout
  } catch (err) {
    console.log('RVM current error', err)
    process.exit(1)
  }
  return version
}

/* original bash
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
