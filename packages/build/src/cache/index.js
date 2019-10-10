const path = require('path')

const makeDir = require('make-dir')
const del = require('del')
const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('./moveCache')

// https://github.com/netlify/buildbot/blob/4f9545d11ca266bd58b6de4ff24de132b8338287/script/run-build.sh#L38
// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L586
async function cacheArtifacts(cwd, cacheDir) {
  const { HOME, GO_IMPORT_PATH, GOPATH, NODE_VERSION, NVM_DIR, CUSTOM_RUBY, RUBY_VERSION, RVM_DIR } = process.env

  console.log('Caching artifacts')
  // 'relative path' : 'Message'
  const cacheCwd = cacheDeps(
    {
      '.bundle': 'ruby gems',
      bower_components: 'bower components',
      node_modules: 'node modules',
      '.venv': 'python virtualenv',
      wapm_packages: 'wapm packages'
    },
    cwd,
    cacheDir
  )

  const cacheHomeDir = cacheDeps(
    {
      '.yarn_cache': 'yarn cache',
      '.cache': 'pip cache',
      '.cask': 'emacs cask dependencies',
      '.emacs.d': 'emacs cache',
      '.m2': 'maven dependencies',
      '.boot': 'boot dependencies',
      '.composer': 'composer dependencies',
      '.wasmer/cache': 'wasmer cache'
    },
    HOME,
    cacheDir
  )

  await Promise.all(cacheCwd.concat(cacheHomeDir))

  if (GO_IMPORT_PATH) {
    const goPath = path.join(GOPATH, 'src', GO_IMPORT_PATH)
    // unlink $GOPATH/src/$GO_IMPORT_PATH
    await del(goPath, { force: true })
  }

  // chmod -R +rw $HOME/.gimme_cache
  const goCache = path.join(HOME, '.gimme_cache')
  await execa('chmod', ['-R', '+rw', goCache])
  // cache_home_directory ".gimme_cache" "go dependencies"
  await moveCache(goCache, path.join(cacheDir, '.gimme_cache'), 'go dependencies')

  // cache the version of node installed
  const cacheNodePath = `${cacheDir}/node_version`
  const cacheNodePathVersion = `${cacheNodePath}/${NODE_VERSION}`
  if (await pathExists(cacheNodePathVersion)) {
    // rm -rf $NETLIFY_CACHE_DIR/node_version
    await del(cacheNodePath, { force: true })
    // mkdir $NETLIFY_CACHE_DIR/node_version
    await makeDir(cacheNodePath)
    // mv $NVM_DIR/versions/node/* $NETLIFY_CACHE_DIR/node_version/
    await moveCache(path.join(NVM_DIR, 'versions/node'), path.join(cacheDir, 'node_version'), 'node deps')
  }

  // cache the version of ruby installed
  const rubyPath = `${cacheDir}/ruby_version`
  if (CUSTOM_RUBY && CUSTOM_RUBY !== '0') {
    const rubyCustomVersionPath = `${rubyPath}/ruby-${RUBY_VERSION}`
    if (await pathExists(rubyCustomVersionPath)) {
      // rm -rf $NETLIFY_CACHE_DIR/ruby_version
      await del(rubyPath, { force: true })
      // mkdir $NETLIFY_CACHE_DIR/ruby_version
      await makeDir(rubyPath)
      // mv $RVM_DIR/rubies/ruby-$RUBY_VERSION $NETLIFY_CACHE_DIR/ruby_version/
      await moveCache(
        path.join(RVM_DIR, 'rubies', `ruby-${RUBY_VERSION}`),
        path.join(cacheDir, 'ruby_version'),
        'ruby deps'
      )
    }
  } else {
    // rm -rf $NETLIFY_CACHE_DIR/ruby_version
    await del(rubyPath, { force: true })
  }
}

function cacheDeps(map, src, dest) {
  return Object.keys(map).map(key => {
    const cwdPath = path.join(src, key)
    const cachePath = path.join(dest, key)
    const message = map[key]
    return moveCache(cwdPath, cachePath, message)
  })
}

module.exports = cacheArtifacts

/*
#
# Take things installed during the build and cache them
#
restore_home_cache() {
  move_cache "$NETLIFY_CACHE_DIR/$1" "$HOME/$1" "restoring cached $2"
}

cache_home_directory() {
  move_cache "$HOME/$1" "$NETLIFY_CACHE_DIR/$1" "saving $2"
}

restore_cwd_cache() {
  move_cache "$NETLIFY_CACHE_DIR/$1" "$PWD/$1" "restoring cached $2"
}

cache_cwd_directory() {
  move_cache "$PWD/$1" "$NETLIFY_CACHE_DIR/$1" "saving $2"
}

cache_artifacts() {
  echo "Caching artifacts"
  cache_cwd_directory ".bundle" "ruby gems"
  cache_cwd_directory "bower_components" "bower components"
  cache_cwd_directory "node_modules" "node modules"
  cache_cwd_directory ".venv" "python virtualenv"
  cache_cwd_directory "wapm_packages", "wapm packages"

  cache_home_directory ".yarn_cache" "yarn cache"
  cache_home_directory ".cache" "pip cache"
  cache_home_directory ".cask" "emacs cask dependencies"
  cache_home_directory ".emacs.d" "emacs cache"
  cache_home_directory ".m2" "maven dependencies"
  cache_home_directory ".boot" "boot dependencies"
  cache_home_directory ".composer" "composer dependencies"
  cache_home_directory ".wasmer/cache", "wasmer cache"

  # Don't follow the Go import path or we'll store
  # the origin repo twice.
  if [ -n "$GO_IMPORT_PATH" ]
  then
    unlink $GOPATH/src/$GO_IMPORT_PATH
  fi

  chmod -R +rw $HOME/.gimme_cache
  cache_home_directory ".gimme_cache" "go dependencies"

  # cache the version of node installed
  if ! [ -d $NETLIFY_CACHE_DIR/node_version/$NODE_VERSION ]
  then
    rm -rf $NETLIFY_CACHE_DIR/node_version
    mkdir $NETLIFY_CACHE_DIR/node_version
    mv $NVM_DIR/versions/node/* $NETLIFY_CACHE_DIR/node_version/
  fi

  # cache the version of ruby installed
  if [[ "$CUSTOM_RUBY" -ne "0" ]]
  then
    if ! [ -d $NETLIFY_CACHE_DIR/ruby_version/ruby-$RUBY_VERSION ]
    then
      rm -rf $NETLIFY_CACHE_DIR/ruby_version
      mkdir $NETLIFY_CACHE_DIR/ruby_version
      mv $RVM_DIR/rubies/ruby-$RUBY_VERSION $NETLIFY_CACHE_DIR/ruby_version/
      echo "Cached ruby version $RUBY_VERSION"
    fi
  else
    rm -rf $NETLIFY_CACHE_DIR/ruby_version
  fi
}
*/
