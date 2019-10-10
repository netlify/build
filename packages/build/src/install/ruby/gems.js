const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')
const { writeFile } = require('../../utils/fs')
const shasum = require('../utils/shasum')
const shouldInstallDeps = require('../utils/shouldInstallDeps')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L313-L332
module.exports = async function installRubyGems(cwd, cacheDir) {
  const { RUBY_VERSION, BUNDLER_FLAGS } = process.env
  const gemFile = `${cwd}/Gemfile`
  const gemBundleDir = `${cwd}/.bundle`
  if (await pathExists(gemFile)) {
    // restore_cwd_cache ".bundle" "ruby gems"
    await moveCache(path.join(cacheDir, '.bundle'), gemBundleDir, 'restoring cached ruby gems')

    const gemLockPath = path.join(cwd, 'Gemfile.lock')
    const previousShaPath = path.join(cacheDir, 'gemfile-sha')
    if ((await shouldInstallDeps(gemLockPath, RUBY_VERSION, previousShaPath)) || !(await pathExists(gemBundleDir))) {
      console.log('Installing gem bundle')
      try {
        await execa(
          'bundle',
          ['install', '--path', '$NETLIFY_CACHE_DIR/bundle', '--binstubs=$NETLIFY_CACHE_DIR/binstubs'].concat(
            BUNDLER_FLAGS ? [BUNDLER_FLAGS] : []
          )
          // @TODO ^ verify this ${BUNDLER_FLAGS:+"$BUNDLER_FLAGS"}
        )
      } catch (err) {
        console.log('Error during gem install')
        console.log(err)
      }
      console.log('Gem bundle installed')

      /* write new shasum to file */
      // echo "$(shasum Gemfile.lock)-$RUBY_VERSION" > $NETLIFY_CACHE_DIR/gemfile-sha
      const sha = await shasum(gemLockPath)
      const newSha = `${sha}-${RUBY_VERSION}`
      await writeFile(previousShaPath, newSha)
    }
    // export PATH=$NETLIFY_CACHE_DIR/binstubs:$PATH
    process.env.PATH = `${cacheDir}/binstubs:${process.env.PATH}`
  }
}

/* original bash script
# Rubygems
if [ -f Gemfile ]
then
  restore_cwd_cache ".bundle" "ruby gems"
  if install_deps Gemfile.lock $RUBY_VERSION $NETLIFY_CACHE_DIR/gemfile-sha || [ ! -d .bundle ]
  then
    echo "Installing gem bundle"
    if bundle install --path $NETLIFY_CACHE_DIR/bundle --binstubs=$NETLIFY_CACHE_DIR/binstubs ${BUNDLER_FLAGS:+"$BUNDLER_FLAGS"}
    then
    export PATH=$NETLIFY_CACHE_DIR/binstubs:$PATH
      echo "Gem bundle installed"
    else
      echo "Error during gem install"
      exit 1
    fi
    echo "$(shasum Gemfile.lock)-$RUBY_VERSION" > $NETLIFY_CACHE_DIR/gemfile-sha
  else
    export PATH=$NETLIFY_CACHE_DIR/binstubs:$PATH
  fi
fi
*/
