const path = require('path')

const execa = require('execa')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L490-L505
module.exports = async function installZola(cwd, cacheDir) {
  const { ZISI_VERSION } = process.env
  if (ZISI_VERSION) {
    console.log(`Installing Zip-it-and-ship-it ${ZISI_VERSION}`)

    let zipAndShip = {}
    try {
      const binrcVersion = await getBinRcVersion()
      const binRcPath = path.join(cacheDir, `.binrc-${binrcVersion}`)
      zipAndShip = await execa('binrc', ['install', '-c', binRcPath, 'netlify/zip-it-and-ship-it', ZISI_VERSION])
    } catch (err) {
      console.log(`Error during zip/ship install ${ZISI_VERSION}`)
      console.log(err)
      process.exit(1)
    }

    if (!zipAndShip.stdout) {
      console.log('NO zipAndShip STDOUT. FIX')
    }

    const installPath = zipAndShip.stdout
    await execa('ln', ['-s', installPath, `/opt/buildhome/.binrc/bin/zip-it-and-ship-it_${ZISI_VERSION}`])

    await execa('ln', [
      '-s',
      `/opt/buildhome/.binrc/bin/zip-it-and-ship-it_${ZISI_VERSION}`,
      '/opt/buildhome/.binrc/bin/zip-it-and-ship-it'
    ])

    const version = await execa('zip-it-and-ship-it', ['--version'])
    console.log(`zip-it-and-ship-it version: ${version.stdout}`)
  }
}

// TODO extract and only call once. See zola & hugo
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
# zip-it-and-ship-it
if [ -n "$ZISI_VERSION" ]
then
  echo "Installing Zip-it-and-ship-it $ZISI_VERSION"

  zisiOut=$(binrc install -c $NETLIFY_BUILD_BASE/.binrc netlify/zip-it-and-ship-it $ZISI_VERSION)
  if [ $? -eq 0 ]
  then
    ln -s $zisiOut /opt/buildhome/.binrc/bin/zip-it-and-ship-it_${ZISI_VERSION}
    ln -s /opt/buildhome/.binrc/bin/zip-it-and-ship-it_${ZISI_VERSION} /opt/buildhome/.binrc/bin/zip-it-and-ship-it
    echo zip-it-and-ship-it version: $(zip-it-and-ship-it --version)
  else
    echo "Error during Zip-it-and-ship-it $ZISI_VERSION install: $zisiOut"
    exit 1
  fi
fi
*/
