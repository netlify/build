const path = require('path')

const execa = require('execa')
const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { readFile, removeFiles } = require('../../utils/fs')
const moveCache = require('../../cache/moveCache')
const source = require('../utils/source')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L525-L556
module.exports = async function installGo(cwd, cacheDir, version) {
  console.log('INSTALL GO')
  const { GIMME_GO_VERSION, GO_IMPORT_PATH, GOPATH } = process.env
  let installGoVersion = version
  const goVersionFile = `${cwd}/.go-version`

  // Restore cached go
  await moveCache(path.join(cacheDir, 'gimme_cache'), path.join(cwd, 'gimme_cache'), 'restoring cached go cache')

  if (await pathExists(goVersionFile)) {
    const goVersion = await readFile(goVersionFile)
    if (goVersion !== version) {
      installGoVersion = goVersion
    }
  }

  if (installGoVersion !== GIMME_GO_VERSION) {
    console.log(`Installing Go version ${installGoVersion}`)
    try {
      process.env.GIMME_ENV_PREFIX = `${process.env.HOME}/.gimme_cache/env`
      process.env.GIMME_VERSION_PREFIX = `${process.env.HOME}/.gimme_cache/versions`
      await execa('gimme', [installGoVersion])
    } catch (err) {
      console.log(`Failed to install Go version ${installGoVersion}`)
      process.exit(1)
    }

    await sourceGo(installGoVersion, process.env.HOME)
  } else {
    try {
      await execa('gimme')
    } catch (err) {
      console.log(`gimme not found`, err)
      process.exit(1)
    }
    await sourceGo(GIMME_GO_VERSION, process.env.HOME)
  }

  // Setup project GOPATH
  if (GO_IMPORT_PATH) {
    const importPath = `${GOPATH}/src/${GO_IMPORT_PATH}`
    await makeDir(importPath)

    await removeFiles([`${importPath}/**`])

    const ln = await execa('ln', ['-s', '/opt/buildhome/repo', importPath])
    if (ln.stdout) {
      console.log(ln.stdout)
    }
  }
}

async function sourceGo(version, home) {
  console.log('source go', version)
  try {
    await source(`${home}/.gimme/env/go${version}.linux.amd64.env`)
  } catch (err) {
    console.log(`Go source failed`, err)
    process.exit(1)
  }
}

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
