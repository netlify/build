const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')
const { writeFile } = require('../../utils/fs')
const shasum = require('../utils/shasum')
const shouldInstallDeps = require('../utils/shouldInstallDeps')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L406-L424
module.exports = async function installLeiningen(cwd, cacheDir) {
  const { JAVA_VERSION } = process.env
  const leiningenConfig = `${cwd}/project.clj`

  if (await pathExists(leiningenConfig)) {
    // restore_home_cache ".m2" "maven dependencies"
    await moveCache(path.join(cacheDir, '.m2'), path.join(cwd, '.m2'), 'restoring cached maven dependencies')

    const previousSha = path.join(cacheDir, 'project-clj-sha')
    if (await shouldInstallDeps(leiningenConfig, JAVA_VERSION, previousSha)) {
      console.log('Installing Leiningen dependencies')
      try {
        await execa('lein', ['deps'])
      } catch (err) {
        console.log('Error during Leiningen install')
        console.log(err)
        process.exit(1)
      }

      /* write new shasum to file */
      // echo "$(shasum project.clj)-$JAVA_VERSION" > $NETLIFY_CACHE_DIR/project-clj-sha
      const sha = await shasum(leiningenConfig)
      const newSha = `${sha}-${JAVA_VERSION}`
      await writeFile(previousSha, newSha)
    } else {
      console.log('Leiningen dependencies found in cache')
    }
  }
}

/*
# Leiningen
if [ -f project.clj ]
then
  restore_home_cache ".m2" "maven dependencies"
  if install_deps project.clj $JAVA_VERSION $NETLIFY_CACHE_DIR/project-clj-sha
  then
    echo "Installing Leiningen dependencies"
    if lein deps
    then
      echo "Leiningen dependencies installed"
    else
      echo "Error during Leiningen install"
      exit 1
    fi
    echo "$(shasum project.clj)-$JAVA_VERSION" > $NETLIFY_CACHE_DIR/project-clj-sha
  else
    echo "Leiningen dependencies found in cache"
  fi
fi
 */
