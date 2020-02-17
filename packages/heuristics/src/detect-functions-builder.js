const path = require('path')
const fs = require('fs')
const util = require('util')

const chalk = require('chalk')

const { getLanguageVersion } = require('./utils/jsdetect')

const readDirAsync = util.promisify(fs.readdir)
const statAsync = util.promisify(fs.stat)

module.exports = async function detectFunctionsBuilder(functionsDir) {
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
    .filter(Boolean);

  const functionsPath = path.join(process.cwd(), functionsDir)
  const settings = {
    src: functionsPath,
    functions: {}
  }

  for (const i in detectors) {
    const functionSettings = detectors[i](functionsPath)
    if (functionSettings) {
      if (functionSettings.language && !functionSettings.language.includes(':')) {
        functionSettings.language = [functionSettings.language, getLanguageVersion(functionSettings.language, functionsPath)].join(':')
      }
      settings.functions["/"] = functionSettings
      break
    }
  }

  const functionsContents = await readDirAsync(functionsPath)
  for (const x in functionsContents) {
    const item = functionsContents[x]
    const stats = await statAsync(item)
    if (stats.isDirectory()) {
      for (const i in detectors) {
        const currentPath = path.join(functionsPath, item)
        const functionSettings = detectors[i]()
        if (functionSettings) {
          if (functionSettings.language && !functionSettings.language.includes(':')) {
            functionSettings.language = [functionSettings.language, getLanguageVersion(functionSettings.language, currentPath)].join(':')
          }
          settings.functions[path.join("/", item)] = functionSettings
          break
        }
      }
    }
  }

  if (settings.possibleArgsArrs && settings.possibleArgsArrs.length) {
    settings.args = settings.possibleArgsArrs[0]
  }
  if (!settings.args) {
    // eslint-disable-next-line no-console
    console.error('empty args assigned, this is an internal Netlify Build bug, please report your settings and scripts so we can improve', { settings })
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }

  return settings
}
