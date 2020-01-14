const path = require('path')
const fs = require('fs')

const chalk = require('chalk')
const inquirer = require('inquirer')
const fuzzy = require('fuzzy')

module.exports = async function detectProjectSettings() {
  const detectors = fs
    .readdirSync(path.join(__dirname, 'detectors'))
    .filter(x => x.endsWith('.js')) // only accept .js detector files
    .map(det => {
      try {
        return require(path.join(__dirname, `detectors/${det}`))
      } catch (err) {
        console.error(
          `failed to load detector: ${chalk.yellow(
            det
          )}, this is likely a bug in the detector, please file an issue in Netlify Build repo.`,
          err
        )
        return null
      }
    })
    .filter(Boolean)
  let settingsArr = []
  let settings = null
  for (const i in detectors) {
    const detectorResult = detectors[i]()
    if (detectorResult) settingsArr.push(detectorResult)
  }
  if (settingsArr.length === 1) {
    // vast majority of projects will only have one matching detector
    settings = settingsArr[0]
    settings.args = settings.possibleArgsArrs[0] // just pick the first one
    if (!settings.args) {
      const { scripts } = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }))
      // eslint-disable-next-line no-console
      console.error(
        'empty args assigned, this is an internal Netlify Dev bug, please report your settings and scripts so we can improve',
        { scripts, settings }
      )
      // eslint-disable-next-line no-process-exit
      process.exit(1)
    }
  } else if (settingsArr.length > 1) {
    /** multiple matching detectors, make the user choose */
    // lazy loading on purpose
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
    const scriptInquirerOptions = formatSettingsArrForInquirer(settingsArr)
    const { chosenSetting } = await inquirer.prompt({
      name: 'chosenSetting',
      message: `Multiple possible start commands found`,
      type: 'autocomplete',
      source: async function(_, input) {
        if (!input || input === '') {
          return scriptInquirerOptions
        }
        // only show filtered results
        return filterSettings(scriptInquirerOptions, input)
      }
    })
    settings = chosenSetting // finally! we have a selected option
    // TODO: offer to save this setting to netlify.toml so you dont keep doing this
  }

  return settings
}

/** utilities for the inquirer section above */
function filterSettings(scriptInquirerOptions, input) {
  const filteredSettings = fuzzy.filter(input, scriptInquirerOptions.map(x => x.name))
  const filteredSettingNames = filteredSettings.map(x => (input ? x.string : x))
  return scriptInquirerOptions.filter(t => filteredSettingNames.includes(t.name))
}

/** utiltities for the inquirer section above */
function formatSettingsArrForInquirer(settingsArr) {
  let ans = []
  settingsArr.forEach(setting => {
    setting.possibleArgsArrs.forEach(args => {
      ans.push({
        name: `[${chalk.yellow(setting.type)}] ${setting.command} ${args.join(' ')}`,
        value: { ...setting, args },
        short: setting.type + '-' + args.join(' ')
      })
    })
  })
  return ans
}
