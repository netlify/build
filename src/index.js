const path = require('path')
const makeDir = require('make-dir')
const execa = require('execa')
const installDependencies = require('./install')
const installMissingCommands = require('./install/missing-commands')
const setGoImportPath = require('./install/set-go-import-path')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))

const NETLIFY_BUILD_BASE = '/opt/buildhome'
const NETLIFY_CACHE_DIR = `${NETLIFY_BUILD_BASE}/cache`
const NETLIFY_REPO_DIR = `${NETLIFY_BUILD_BASE}/repo`
const CWD = process.cwd()

const directories = [
  // # language versions
  `${NETLIFY_CACHE_DIR}/node_version`,
  `${NETLIFY_CACHE_DIR}/ruby_version`,
  // # pwd caches`
  `${NETLIFY_CACHE_DIR}/node_modules`,
  `${NETLIFY_CACHE_DIR}/.bundle`,
  `${NETLIFY_CACHE_DIR}/bower_components`,
  `${NETLIFY_CACHE_DIR}/.venv`,
  `${NETLIFY_CACHE_DIR}/wapm_packages`,
  // # HOME caches
  `${NETLIFY_CACHE_DIR}/.yarn_cache`,
  `${NETLIFY_CACHE_DIR}/.cache`,
  `${NETLIFY_CACHE_DIR}/.cask`,
  `${NETLIFY_CACHE_DIR}/.emacs.d`,
  `${NETLIFY_CACHE_DIR}/.m2`,
  `${NETLIFY_CACHE_DIR}/.boot`,
  `${NETLIFY_CACHE_DIR}/.composer`,
  `${NETLIFY_CACHE_DIR}/.gimme_cache/gopath`,
  `${NETLIFY_CACHE_DIR}/.gimme_cache/gocache`,
  `${NETLIFY_CACHE_DIR}/.wasmer/cache`,
]

const globals = {
  GIMME_TYPE: 'binary',
  GIMME_NO_ENV_ALIAS: true,
  GIMME_CGO_ENABLED: true,
  NVM_DIR: '$HOME/.nvm',
  RVM_DIR: '$HOME/.rvm',
  // Pipenv configuration
  PIPENV_RUNTIME: 2.7,
  PIPENV_VENV_IN_PROJECT: 1,
  PIPENV_DEFAULT_PYTHON_VERSION: 2.7,
  // CI signal
  NETLIFY: true
}

async function runBuildFunction() {
  // Whats NETLIFY_VERBOSE do?

  /* Set Globals env vars */
  Object.keys(globals).map((key) => {
    process.env[key] = globals[key]
  })

  /* Make directories */
  const newDirPaths = await Promise.all(directories.map((dir) => {
    return makeDir(dir)
  }))
}

// fields.BuildDir, fields.NodeVersion, fields.RubyVersion, fields.YarnVersion, fields.BuildCmd, fields.FunctionsDir, fields.ZisiTempDir

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
async function runBuild(config) {
  const {
    buildDir,
    buildCmd,
    functionsDir,
    zisiTempDir,
    nodeVersion,
    rubyVersion,
    yarnVersion
  } = config
  // inputs from Buildbot
  const parentDir = path.dirname(buildDir)
  const phpVersion = '5.6'

  // 
  await runBuildFunction()

  console.log('Installing dependencies')
  await installDependencies({
    nodeVersion,
    rubyVersion,
    yarnVersion,
    phpVersion,
    goVersion: '.shrug',
    CWD: CWD,
    NETLIFY_CACHE_DIR: NETLIFY_CACHE_DIR
  })

  /* Parse build command and try to fix missing deps */
  await installMissingCommands(CWD, NETLIFY_CACHE_DIR, buildCmd)

  console.log('Verify run directory')
  await setGoImportPath(CWD)

  /* Run the build command */
  console.log('Executing user command: $cmd')
  try {
    // TODO parse buildCmd or execa.shell
    await execa(buildCmd)
  } catch (err) {
    console.log('Build Error', err)
    process.exit(1)
  }

  /* Compile serverless functions */
  // prep_functions $functions_dir $zisi_temp_dir

  /* Cache all the things */
  // cache_artifacts

  /* Report lingering process */
  // report_lingering_procs
  // https://www.npmjs.com/package/ps-list
}
