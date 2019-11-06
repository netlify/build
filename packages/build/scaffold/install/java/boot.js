const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')
const { writeFile } = require('../../utils/fs')
const shasum = require('../utils/shasum')
const shouldInstallDeps = require('../utils/shouldInstallDeps')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L426-L445
module.exports = async function installBoot(cwd, cacheDir) {
  const { JAVA_VERSION } = process.env
  const bootConfig = `${cwd}/build.boot`

  if (await pathExists(bootConfig)) {
    // restore_home_cache ".m2" "maven dependencies"
    await moveCache(path.join(cacheDir, '.m2'), path.join(cwd, '.m2'), 'restoring cached maven dependencies')
    // restore_home_cache ".boot" "boot dependencies"
    await moveCache(path.join(cacheDir, '.boot'), path.join(cwd, '.boot'), 'restoring cached boot dependencies')

    const buildBootFile = path.join(cwd, 'build.boot')
    const previousSha = path.join(cacheDir, 'project-boot-sha')
    if (await shouldInstallDeps(buildBootFile, JAVA_VERSION, previousSha)) {
      console.log('Installing Boot dependencies')
      try {
        await execa('boot', ['pom', 'jar', 'install'])
      } catch (err) {
        console.log('Error during Boot install')
        console.log(err)
        process.exit(1)
      }

      /* write new shasum to file */
      // echo "$(shasum build.boot)-$JAVA_VERSION" > $NETLIFY_CACHE_DIR/project-boot-sha
      const sha = await shasum(buildBootFile)
      const newSha = `${sha}-${JAVA_VERSION}`
      await writeFile(previousSha, newSha)
    } else {
      console.log('Boot dependencies found in cache')
    }
  }
}

/*
# Boot
if [ -f build.boot ]
then
  restore_home_cache ".m2" "maven dependencies"
  restore_home_cache ".boot" "boot dependencies"
  if install_deps build.boot $JAVA_VERSION $NETLIFY_CACHE_DIR/project-boot-sha
  then
    echo "Installing Boot dependencies"
    if boot pom jar install
    then
      echo "Boot dependencies installed"
    else
      echo "Error during Boot install"
      exit 1
    fi
    echo "$(shasum build.boot)-$JAVA_VERSION" > $NETLIFY_CACHE_DIR/project-boot-sha
  else
    echo "Boot dependencies found in cache"
  fi
fi
 */
