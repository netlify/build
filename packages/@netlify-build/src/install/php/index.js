const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L297-L311
module.exports = async function installPhp(cwd, cacheDir, version) {
  const { HOME } = process.env
  const phpBinPath = path.normalize(`/usr/bin/php${version}`)
  if (await pathExists(phpBinPath)) {
    try {
      await execa('ln', ['-sf', phpBinPath, `${HOME}/.php/php`])
    } catch (err) {
      console.log(`PHP version ${version} does not exist`)
      console.log(err)
    }
  }
}

/*
# PHP version
: ${PHP_VERSION="$defaultPHPVersion"}
if [ -f /usr/bin/php$PHP_VERSION ]
then
  if ln -sf /usr/bin/php$PHP_VERSION $HOME/.php/php
  then
    echo "Using PHP version $PHP_VERSION"
  else
    echo "Failed to switch to PHP version $PHP_VERSION"
    exit 1
  fi
else
  echo "PHP version $PHP_VERSION does not exist"
  exit 1
fi
*/
