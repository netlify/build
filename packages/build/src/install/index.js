const installPhp = require('./php')
const installPython = require('./python')
const installPipDeps = require('./python/pip')
const installNode = require('./node/install-node')
const installNodeDeps = require('./node/install-deps')
const installBowerDeps = require('./node/bower')
const installRubyGems = require('./ruby/gems')
const installLeiningen = require('./java/leiningen')
const installBoot = require('./java/boot')
const installGo = require('./go')
const installHugo = require('./go/hugo')
const installZola = require('./rust/zola')
const installCask = require('./misc/cask')
const installComposerDeps = require('./php/composer')
const installWapm = require('./misc/wapm')
const installZipAndShip = require('./serverless/zip-and-ship')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L59-L581
module.exports = async function installDependencies(config = {}) {
  const { nodeVersion, yarnVersion, phpVersion, goVersion, CWD, NETLIFY_CACHE_DIR } = config
  console.log(CWD, NETLIFY_CACHE_DIR)
  await installPython(CWD, NETLIFY_CACHE_DIR)

  await installNode(CWD, NETLIFY_CACHE_DIR, nodeVersion)

  // await installRuby(CWD, NETLIFY_CACHE_DIR, rubyVersion)

  // await installJava(CWD, NETLIFY_CACHE_DIR)
  // process.env.JAVA_VERSION = default_sdk
  // @TODO what is default_sdk?

  await installPhp(CWD, NETLIFY_CACHE_DIR, phpVersion)

  /* Ruby gems */
  await installRubyGems(CWD, NETLIFY_CACHE_DIR)

  /* PIP dependencies */
  await installPipDeps(CWD, NETLIFY_CACHE_DIR)

  /* NPM Dependencies */
  await installNodeDeps(CWD, NETLIFY_CACHE_DIR, yarnVersion)

  /* Bower Dependencies */
  await installBowerDeps(CWD, NETLIFY_CACHE_DIR)

  /* Leiningen */
  await installLeiningen(CWD, NETLIFY_CACHE_DIR)

  /* Boot */
  await installBoot(CWD, NETLIFY_CACHE_DIR)

  /* Hugo */
  await installHugo(CWD, NETLIFY_CACHE_DIR)

  /* Gutenberg */
  // Its dead and now called ZOLA await installGutenberg(CWD, NETLIFY_CACHE_DIR)

  /* Zola */
  await installZola(CWD, NETLIFY_CACHE_DIR)

  /* Zip and ship */
  await installZipAndShip(CWD, NETLIFY_CACHE_DIR)

  /* Cask */
  await installCask(CWD, NETLIFY_CACHE_DIR)

  /* PHP Composer dependencies */
  await installComposerDeps(CWD, NETLIFY_CACHE_DIR)

  /* Go version */
  await installGo(CWD, NETLIFY_CACHE_DIR, goVersion)

  /* WAPM version */
  await installWapm(CWD, NETLIFY_CACHE_DIR)

  /* should already be set from installGo
  # Setup project GOPATH
   if [ -n "$GO_IMPORT_PATH" ]
   then
     mkdir -p "$(dirname $GOPATH/src/$GO_IMPORT_PATH)"
     rm -rf $GOPATH/src/$GO_IMPORT_PATH
     ln -s /opt/buildhome/repo ${GOPATH}/src/$GO_IMPORT_PATH
   fi
  */
}
