const os = require('os')
const { resolve, dirname } = require('path')

const findUp = require('find-up')
const execa = require('execa')
const chalk = require('chalk')
const { diff } = require('run-if-diff')

const logPrefix = '>> '
/**
 * Mono repo support
 * @param  {object} config - Plugin configuration
 * @param  {object} config.file - directories to use to determine if build should run
 */
module.exports = {
  name: '@netlify/plugin-monorepo',
  onInit: async ({ pluginConfig }) => {
    const { files, since } = pluginConfig

    if (!files) {
      console.log('monorepo plugin requires files array to work')
      return
    }

    const filesArray = typeof files === 'string' ? [files] : files

    /* Todo decide if config change should ignore mono repo ignore and trigger build
      const defaultFiles = [
        'netlify.toml',
        'netlify.yml',
        'netlify.js',
        'netlify.json'
      ]
      */
    const defaultFiles = []
    const gitRoot = findRoot()
    const filesToCheck = defaultFiles.concat(filesArray).map(name => {
      const regex = new RegExp(`^${gitRoot}/`)
      return resolve(name).replace(regex, '')
    })

    console.log(chalk.yellowBright('Determining if build should proceed...\n'))
    console.log('Checking Paths')
    filesToCheck.forEach(p => {
      console.log(`- ${p}`)
    })
    console.log()
    try {
      const currentBranch = await gitBranchName()
      const result = await diff({
        since: since || currentBranch,
        files: filesToCheck,
      })
      console.log('result', result)
      if (!result.matched.length) {
        console.log(chalk.greenBright(`No file changes detected\n`))
        console.log(chalk.greenBright(`Exit build early 🎉\n`))
        process.exit(0)
      }
      // console.log(`Detected changes in:`, result.matched)
      const changedFiles = result.matched.map(file => {
        return {
          path: file,
          fullPath: resolve(file),
        }
      })
      // console.log('changedFiles', changedFiles)
      const changeWord = changedFiles.length > 1 ? 'changes' : 'change'
      console.log(chalk.cyanBright(`${logPrefix}Detected ${changedFiles.length} file ${changeWord}\n`))
      changedFiles.forEach(file => {
        console.log(`File ${chalk.yellowBright(file.path)} changed`)
      })
      console.log()
      console.log(chalk.greenBright(`${logPrefix}Proceed with Build!\n`))
    } catch (error) {
      console.error(error)
      process.exit(0)
    }
  },
}

// Finds cwd's parent root directory
function findRoot(cwd) {
  const rootIndicator = findUp.sync(['.git'], {
    cwd: cwd || process.cwd(),
    type: 'directory',
  })
  if (typeof rootIndicator !== 'string' || rootIndicator == null) return cwd

  const indicatorRoot = dirname(rootIndicator)
  // To avoid thinking our project root is our global config
  const root = indicatorRoot !== os.homedir() ? indicatorRoot : cwd

  return root
}

async function gitBranchName() {
  try {
    const { stdout } = await execa.command('git rev-parse --abbrev-ref HEAD')
    return stdout.trim()
  } catch (e) {
    console.log(`gitBranchName Error`, e)
  }
}
