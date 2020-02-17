const path = require('path')
const fs = require('fs')
const util = require('util')

const chalk = require('chalk')

const readDirAsync = util.promisify(fs.readdir)
const readFileAsync = util.promisify(fs.readFile)

module.exports = async function detectProjectSettings() {
  const detectors = (await readDirAsync(path.join(__dirname, 'detectors')))
    .filter(x => x.endsWith('.js')) // only accept .js detector files
    .map(det => {
      try {
        return require(path.join(__dirname, `detectors/${det}`))
      } catch (err) {
        console.error(
          `failed to load detector: ${chalk.yellow(
            det,
          )}, this is likely a bug in the detector, please file an issue in Netlify Build repo.`,
          err,
        )
        return null
      }
    })
    .filter(Boolean)
  let settings = null
  for (const i in detectors) {
    const detectorResult = detectors[i]()
    if (detectorResult) {
      settings = detectorResult
      break
    }
  }
  if (!settings) return {}
  // vast majority of projects will only have one matching detector
  settings.args = settings.possibleArgsArrs[0] // just pick the first one
  if (!settings.args) {
    const { scripts } = JSON.parse(await readFileAsync('package.json', { encoding: 'utf8' }))
    // eslint-disable-next-line no-console
    console.error(
      'empty args assigned, this is an internal Netlify Dev bug, please report your settings and scripts so we can improve',
      { scripts, settings },
    )
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }

  return settings
}
