const path = require('path')

const execa = require('execa')
const chalk = require('chalk')
const { diff } = require('run-if-diff')

/**
 * Mono repo support
 * @param  {object} config - Plugin configuration
 * @param  {object} config.file - directories to use to determine if build should run
 */
module.exports = function netlifyMonoRepoPlugin(config) {
  return {
    init: async ({ pluginConfig, constants: { BASE_DIR } }) => {
      let files = pluginConfig.files
      if (!files) {
        console.log('monorepo plugin requires files array to work')
        return
      }
      /* Todo decide if config change should ignore mono repo ignore and trigger build
      const defaultFiles = [
        'netlify.toml',
        'netlify.yml',
        'netlify.js',
        'netlify.json'
      ]
      */
      const defaultFiles = []

      const filesToCheck = defaultFiles.concat(files).map(name => {
        const parent = path.dirname(BASE_DIR)
        const regex = new RegExp(`^${parent}/`)
        return path.join(BASE_DIR, name).replace(regex, '')
      })
      // console.log('filesToCheck', filesToCheck)

      console.log(chalk.yellowBright('Determining if build should proceed...\n'))
      try {
        const currentBranch = await gitBranchName()
        const result = await diff({
          since: pluginConfig.since || currentBranch,
          files: filesToCheck
        })
        // console.log('result', result)
        if (!result.matched.length) {
          console.log(chalk.redBright(`No files we care about changed.\n`))
          console.log(chalk.redBright(`Exit build early\n`))
          process.exit(0)
        }
        // console.log(`Detected changes in:`, result.matched)
        const changedFiles = result.matched.map(file => {
          return {
            path: file,
            fullPath: path.resolve(file)
          }
        })
        // console.log('changedFiles', changedFiles)
        console.log(chalk.cyanBright(`Detected ${changedFiles.length} file changes\n`))
        changedFiles.forEach(file => {
          console.log(`File ${file.path} changed`)
        })
        console.log()
        console.log(chalk.greenBright('Proceed with Build!\n'))
      } catch (error) {
        console.error(error)
        process.exit(0)
      }
    }
  }
}

async function gitBranchName() {
  try {
    const { stdout } = await execa.command('git rev-parse --abbrev-ref HEAD')
    return stdout.trim()
  } catch (e) {
    console.log(`gitBranchName Error`, e)
  }
}
