const path = require('path')

const execa = require('execa')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L447-L460
module.exports = async function installHugo(cwd, cacheDir) {
  const { HUGO_VERSION } = process.env
  if (HUGO_VERSION) {
    console.log(`Installing Hugo ${HUGO_VERSION}`)

    let hugo = {}
    try {
      const binrcVersion = await getBinRcVersion()
      const binRcPath = path.join(cacheDir, `.binrc-${binrcVersion}`)
      hugo = await execa('binrc', ['install', '-c', binRcPath, 'hugo'])
    } catch (err) {
      console.log(`Error during Hugo ${HUGO_VERSION} install`)
      console.log(err)
      process.exit(1)
    }

    if (!hugo.stdout) {
      console.log('NO HUGO STDOUT. FIX')
    }

    // PATH=$(dirname $hugoOut):$PATH
    const hugoDir = path.dirname(hugo.stdout)
    process.env.PATH = `${hugoDir}:${process.env.PATH}`

    try {
      const version = await execa('hugo', ['version'])
      console.log(version.stdout)
    } catch (err) {
      console.log(`Hugo not found`)
      console.log(err)
      process.exit(1)
    }
  }
}

// TODO extract into util used in Zola
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
# Hugo
if [ -n "$HUGO_VERSION" ]
then
  echo "Installing Hugo $HUGO_VERSION"
  hugoOut=$(binrc install -c $NETLIFY_CACHE_DIR/.binrc-$(binrc version) hugo)
  if [ $? -eq 0 ]
  then
    export PATH=$(dirname $hugoOut):$PATH
    hugo version
  else
    echo "Error during Hugo $HUGO_VERSION install: $hugoOut"
    exit 1
  fi
fi
 */
