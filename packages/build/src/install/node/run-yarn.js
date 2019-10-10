const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')
const { removeFiles, copyFiles } = require('../../utils/fs')

const setTempDir = require('./utils/set-temp-dir')

module.exports = async function runYarn(cwd, cacheDir, yarnVersion) {
  const yarnCacheDir = `${cacheDir}/yarn`
  const yarnHomeDir = `${process.env.HOME}/.yarn`

  if (await pathExists(yarnCacheDir)) {
    /* What does this do?
    export PATH=$NETLIFY_CACHE_DIR/yarn/bin:$PATH
      verify below code
    */
    process.env.PATH = `${cacheDir}/yarn/bin}:${process.env.PATH}`
  }
  /* restore yarn cache */
  await moveCache(path.join(cacheDir, '.yarn_cache'), path.join(cwd, '.yarn_cache'), 'restoring cached .yarn_cache')

  // Look for yarn
  let hasYarn
  try {
    const whichYarn = await execa('which', ['yarn'])
    if (whichYarn.stdout) hasYarn = true
  } catch (err) {
    hasYarn = false
  }

  // Verify the yarn version
  if (hasYarn) {
    const version = await execa('yarn', ['--version'])
    if (version.stdout !== yarnVersion) {
      console.log(`Found yarn version (${version.stdout}) that doesn't match expected (${yarnVersion})"`)
      const deleteDirs = [
        yarnCacheDir,
        path.join(process.env.HOME, '.yarn') // TODO verify path lookup
      ]
      // rm -rf $NETLIFY_CACHE_DIR/yarn $HOME/.yarn
      await removeFiles(deleteDirs)
      // npm uninstall yarn -g
      await execa('npm', ['uninstall', 'yarn', '-g'])
    }
  }

  if (!hasYarn) {
    console.log(`Installing yarn at version ${yarnVersion}`)
    const deleteDirs = [
      yarnHomeDir // TODO verify path lookup
    ]
    // rm -rf $HOME/.yarn
    await removeFiles(deleteDirs)
    // bash /usr/local/bin/yarn-installer.sh --version $yarn_version
    await execa('bash', ['/usr/local/bin/yarn-installer.sh', '--version', yarnVersion])
    // mv $HOME/.yarn $NETLIFY_CACHE_DIR/yarn
    await copyFiles(yarnHomeDir, yarnCacheDir)
    // export PATH=$NETLIFY_CACHE_DIR/yarn/bin:$PATH
    process.env.PATH = `${cacheDir}/yarn/bin:${process.env.PATH}`
  }

  console.log(`Installing NPM modules using Yarn version ${yarnVersion}`)
  await setTempDir()

  /* @TODO. Not sure what this does
  # Remove the cache-folder flag if the user set any.
  # We want to control where to put the cache
  # to be able to store it internally after the build.
  local yarn_local="${YARN_FLAGS/--cache-folder * /}"
  # The previous pattern doesn't match the end of the string.
  # This removes the flag from the end of the string.
  yarn_local="${yarn_local%--cache-folder *}"

  if yarn install --cache-folder $NETLIFY_BUILD_BASE/.yarn_cache ${yarn_local:+"$yarn_local"}
  then
    echo "NPM modules installed using Yarn"
  else
    echo "Error during Yarn install"
    exit 1
  fi
  export PATH=$(yarn bin):$PATH
  */
}

/*
run_yarn() {
  yarn_version=$1
  if [ -d $NETLIFY_CACHE_DIR/yarn ]
  then
    export PATH=$NETLIFY_CACHE_DIR/yarn/bin:$PATH
  fi
  restore_home_cache ".yarn_cache" "yarn cache"

  if [ $(which yarn) ] && [ "$(yarn --version)" != "$yarn_version" ]
  then
    echo "Found yarn version ($(yarn --version)) that doesn't match expected ($yarn_version)"
    rm -rf $NETLIFY_CACHE_DIR/yarn $HOME/.yarn
    npm uninstall yarn -g
  fi

  if ! [ $(which yarn) ]
  then
    echo "Installing yarn at version $yarn_version"
    rm -rf $HOME/.yarn
    bash /usr/local/bin/yarn-installer.sh --version $yarn_version
    mv $HOME/.yarn $NETLIFY_CACHE_DIR/yarn
    export PATH=$NETLIFY_CACHE_DIR/yarn/bin:$PATH
  fi


  echo "Installing NPM modules using Yarn version $(yarn --version)"
  run_npm_set_temp

  # Remove the cache-folder flag if the user set any.
  # We want to control where to put the cache
  # to be able to store it internally after the build.
  local yarn_local="${YARN_FLAGS/--cache-folder * /}"
  # The previous pattern doesn't match the end of the string.
  # This removes the flag from the end of the string.
  yarn_local="${yarn_local%--cache-folder *}"

  if yarn install --cache-folder $NETLIFY_BUILD_BASE/.yarn_cache ${yarn_local:+"$yarn_local"}
  then
    echo "NPM modules installed using Yarn"
  else
    echo "Error during Yarn install"
    exit 1
  fi
  export PATH=$(yarn bin):$PATH
}
 */
