const path = require('path')
const fs = require('fs')
const util = require('util')

const chalk = require('chalk')

const readDirAsync = util.promisify(fs.readdir)

module.exports = async function detectFunctionsBuilder() {
  const detectors = (await readDirAsync(path.join(__dirname, 'function-builder-detectors')))
    .filter(x => x.endsWith('.js')) // only accept .js detector files
    .map(det => {
      try {
        return require(path.join(__dirname, `function-builder-detectors/${det}`))
      } catch (err) {
        console.error(`failed to load functions builder detector: ${chalk.yellow(det)}, this is likely a bug in the detector, please file an issue in Netlify Build repo.`, err)
        return null
      }
    })
    .filter(Boolean)

  let settings
  for (const i in detectors) {
    const settings = detectors[i]()
    if (settings) break
  }

  if (!settings) return {}
  settings.args = settings.possibleArgsArrs[0] || [] // just pick the first one
  if (!settings.args) {
    // eslint-disable-next-line no-console
    console.error('empty args assigned, this is an internal Netlify Build bug, please report your settings and scripts so we can improve', { settings })
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }

  return settings
}
