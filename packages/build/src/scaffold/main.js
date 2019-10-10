/**
 * (WIP) Scaffold docker image, update dependancies, set correct language libs
 * Node port of https://github.com/netlify/build-image/blob/xenial/run-build.sh
 */
const execa = require('execa')

const installDependencies = require('../install')
const cacheArtifacts = require('../cache')
const prepFunctions = require('../install/serverless/prep-functions')
const installMissingCommands = require('../install/missing-commands')
const setGoImportPath = require('../install/set-go-import-path')

const runBuildFunction = require('./utils/create-directories')
const { getProcessCount, findRunningProcs } = require('./utils/findRunningProcs')

const NETLIFY_BUILD_BASE = '/opt/buildhome'
const NETLIFY_CACHE_DIR = `${NETLIFY_BUILD_BASE}/cache`
const CWD = process.cwd()

/*
  fields.BuildDir,
  fields.NodeVersion,
  fields.RubyVersion,
  fields.YarnVersion,
  fields.BuildCmd,
  fields.FunctionsDir,
  fields.ZisiTempDir
 */

/**
 * Run Netlify Build
 * @param  {Object} config - Netlify Build config
 * @param  {String} config.buildDir - Build directory
 * @param  {String} config.buildCmd - Build command
 * @param  {String} config.functionsDir - Functions directory
 * @param  {String} config.zisiTempDir - Zip & ship temp dir... todo remove
 * @param  {String} config.nodeVersion - Node version
 * @param  {String} config.rubyVersion - Ruby version
 * @param  {String} config.yarnVersion - Yarn version
 * @return {[type]}        [description]
 */
module.exports = async function runBuild(config) {
  const { buildCmd, functionsDir, zisiTempDir, nodeVersion, rubyVersion, yarnVersion } = config
  // inputs from Buildbot
  const phpVersion = '5.6'
  const goVersion = '1.12'

  // Fix common build issues
  // Malforms package.json name https://community.netlify.com/t/builds-are-failing-globally-across-projects/1963/3

  // make dirs and set env vars. Todo refactor elsewhere
  await runBuildFunction()

  console.log('Installing dependencies')
  await installDependencies({
    nodeVersion,
    rubyVersion,
    yarnVersion,
    phpVersion,
    goVersion,
    CWD: CWD,
    NETLIFY_CACHE_DIR: NETLIFY_CACHE_DIR
  })

  /* Parse build command and try to fix missing deps */
  await installMissingCommands(CWD, NETLIFY_CACHE_DIR, buildCmd)

  console.log('Verify run directory')
  await setGoImportPath(CWD)

  /* Run the build command */
  console.log('Executing user command:', buildCmd)
  let commandOut
  try {
    // TODO parse buildCmd or execa.shell
    commandOut = await execa.command(buildCmd)
  } catch (err) {
    console.log('Build Error', err)
    process.exit(1)
  }
  console.log(commandOut)

  /* Compile serverless functions */
  await prepFunctions(functionsDir, zisiTempDir)

  /* Cache all the things */
  await cacheArtifacts(CWD, NETLIFY_CACHE_DIR)

  /* Report lingering process */
  const procs = await findRunningProcs()
  const count = getProcessCount(procs) - 1
  if (count > 0) {
    console.log('** WARNING **')
    console.log('There are some lingering processes even after the build process finished: ')
    console.log(`${procs}`)
    console.log('Our builds do not kill your processes automatically, so please make sure')
    console.log('that nothing is running after your build finishes, or it will be marked as')
    console.log('failed since something is still running.')
  }

  // FIN
  process.exit(commandOut.exitCode)
}
