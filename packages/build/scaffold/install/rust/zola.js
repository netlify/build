const path = require('path')

const execa = require('execa')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L476-L488
module.exports = async function installZola(cwd, cacheDir) {
  const { ZOLA_VERSION } = process.env
  if (ZOLA_VERSION) {
    console.log(`Installing Zola ${ZOLA_VERSION}`)

    let zola = {}
    try {
      const binrcVersion = await getBinRcVersion()
      const binRcPath = path.join(cacheDir, `.binrc-${binrcVersion}`)
      zola = await execa('binrc', ['install', '-c', binRcPath, 'zola'])
    } catch (err) {
      console.log(`Error during Zola ${ZOLA_VERSION}`)
      console.log(err)
      process.exit(1)
    }

    if (!zola.stdout) {
      console.log('NO ZOLA STDOUT. FIX')
    }

    // export PATH=$(dirname $zolaOut):$PATH
    const zolaDir = path.dirname(zola.stdout)
    process.env.PATH = `${zolaDir}:${process.env.PATH}`
  }
}

async function getBinRcVersion() {
  let version
  try {
    const { stdout } = await execa('binrc', ['version'])
    version = stdout
  } catch (err) {
    console.log('No binrc version found', err)
  }
  return version
}

/*
# Zola
if [ -n "$ZOLA_VERSION" ]
then
  echo "Installing Zola $ZOLA_VERSION"
  zolaOut=$(binrc install -c $NETLIFY_CACHE_DIR/.binrc-$(binrc version) zola)
  if [ $? -eq 0 ]
  then
    export PATH=$(dirname $zolaOut):$PATH
  else
    echo "Error during Zola $ZOLA_VERSION install: $zolaOut"
    exit 1
  fi
fi
 */
