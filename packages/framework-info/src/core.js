const pFilter = require('p-filter')

const { usesFramework } = require('./detect.js')
const { FRAMEWORKS } = require('./frameworks/main.js')
const { getPackageJsonContent } = require('./package.js')
const { getRunScriptCommand } = require('./run_script.js')
const { getWatchCommands } = require('./watch.js')

const getContext = (context) => {
  const { pathExists, packageJson, packageJsonPath = '.' } = context

  return { pathExists, packageJson, packageJsonPath }
}

/**
 * A callback to check if a path exists
 * @callback PathExists
 * @param {string} path
 * @returns {Promise<boolean>}
 */

/**
 * @typedef {object} Context
 * @property {PathExists} pathExists - Checks if a path exists
 * @property {object} packageJson - Content of package.json
 * @property {string} [packageJsonPath='.'] - Path of package.json
 */

/**
 * @typedef {object} Watch
 * @property {string} commands - Build command, in watch mode. There might be several alternatives
 * @property {string} directory - Relative path to the directory where files are built, in watch mode
 * @property {number} port - Server port
 */

/**
 * @typedef {object} Framework
 * @property {string} name - Name such as `"gatsby"`
 * @property {string} category - Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @property {Watch} watch - Information about the build command, in watch mode.
 * @property {object} env - Environment variables that should be set when calling the watch command
 */

/**
 * Return all the frameworks used by a project.
 *
 * @param  {Context} context - Context
 *
 * @returns {Framework[]} frameworks - Frameworks used by a project
 */
const listFrameworks = async function (context) {
  const { pathExists, packageJson, packageJsonPath } = getContext(context)
  const { npmDependencies, scripts, runScriptCommand } = await getProjectInfo({
    pathExists,
    packageJson,
    packageJsonPath,
  })
  const frameworks = await pFilter(FRAMEWORKS, (framework) => usesFramework(framework, { pathExists, npmDependencies }))
  const frameworkInfos = frameworks.map((framework) => getFrameworkInfo(framework, { scripts, runScriptCommand }))
  return frameworkInfos
}

/**
 * Return whether a project uses a specific framework
 *
 * @param {string} frameworkName - Name such as `"gatsby"`
 * @param  {Context} [context] - Context
 *
 * @returns {boolean} result - Whether the project uses this framework
 */
const hasFramework = async function (frameworkName, context) {
  const framework = getFrameworkByName(frameworkName)
  const { pathExists, packageJson, packageJsonPath } = getContext(context)
  const { npmDependencies } = await getProjectInfo({ pathExists, packageJson, packageJsonPath })
  const result = await usesFramework(framework, { pathExists, npmDependencies })
  return result
}

/**
 * Return some information about a framework used by a project.
 *
 * @param {string} frameworkName - Name such as `"gatsby"`
 * @param  {Context} [context] - Context
 *
 * @returns {Framework} framework - Framework used by a project
 */
const getFramework = async function (frameworkName, context) {
  const framework = getFrameworkByName(frameworkName)
  const { pathExists, packageJson, packageJsonPath } = getContext(context)
  const { scripts, runScriptCommand } = await getProjectInfo({
    pathExists,
    packageJson,
    packageJsonPath,
  })
  const frameworkInfo = getFrameworkInfo(framework, { scripts, runScriptCommand })
  return frameworkInfo
}

const getFrameworkByName = function (frameworkName) {
  const framework = FRAMEWORKS.find(({ name }) => name === frameworkName)
  if (framework === undefined) {
    const frameworkNames = FRAMEWORKS.map(getFrameworkName).join(', ')
    throw new Error(`Invalid framework "${frameworkName}". It should be one of: ${frameworkNames}`)
  }
  return framework
}

const getFrameworkName = function ({ name }) {
  return name
}

const getProjectInfo = async function ({ pathExists, packageJson, packageJsonPath }) {
  const { npmDependencies, scripts } = await getPackageJsonContent({
    packageJson,
  })
  const runScriptCommand = await getRunScriptCommand({ pathExists, packageJsonPath })
  return { npmDependencies, scripts, runScriptCommand }
}

const getFrameworkInfo = function (
  { name, category, watch: { command: frameworkWatchCommand, directory, port }, env },
  { scripts, runScriptCommand },
) {
  const watchCommands = getWatchCommands({ frameworkWatchCommand, scripts, runScriptCommand })
  return { name, category, watch: { commands: watchCommands, directory, port }, env }
}

module.exports = { listFrameworks, hasFramework, getFramework }
