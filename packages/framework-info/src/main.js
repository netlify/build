const pFilter = require('p-filter')

const { usesFramework } = require('./detect.js')
const { FRAMEWORKS } = require('./frameworks/main.js')
const { getOptions } = require('./options.js')
const { getPackageJsonContent } = require('./package.js')
const { getRunScriptCommand } = require('./run_script.js')
const { getWatchCommands } = require('./watch.js')

/**
 * @typedef {object} Options
 * @property {string} [projectDir=process.cwd()] - Project's directory
 * @property {string} [ignoredWatchCommand] - When guessing the watch command, ignore `package.json` `scripts` whose value includes this string
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
 * @param  {Options} [options] - Options
 *
 * @returns {Framework[]} frameworks - Frameworks used by a project
 */
const listFrameworks = async function (opts) {
  const { projectDir, ignoredWatchCommand } = getOptions(opts)
  const { npmDependencies, scripts, runScriptCommand } = await getProjectInfo({ projectDir, ignoredWatchCommand })
  const frameworks = await pFilter(FRAMEWORKS, (framework) => usesFramework(framework, { projectDir, npmDependencies }))
  const frameworkInfos = frameworks.map((framework) => getFrameworkInfo(framework, { scripts, runScriptCommand }))
  return frameworkInfos
}

/**
 * Return whether a project uses a specific framework
 *
 * @param {string} frameworkName - Name such as `"gatsby"`
 * @param  {Options} [options] - Options
 *
 * @returns {boolean} result - Whether the project uses this framework
 */
const hasFramework = async function (frameworkName, opts) {
  const framework = getFrameworkByName(frameworkName)
  const { projectDir, ignoredWatchCommand } = getOptions(opts)
  const { npmDependencies } = await getProjectInfo({ projectDir, ignoredWatchCommand })
  const result = await usesFramework(framework, { projectDir, npmDependencies })
  return result
}

/**
 * Return some information about a framework used by a project.
 *
 * @param {string} frameworkName - Name such as `"gatsby"`
 * @param  {Options} [options] - Options
 *
 * @returns {Framework} framework - Framework used by a project
 */
const getFramework = async function (frameworkName, opts) {
  const framework = getFrameworkByName(frameworkName)
  const { projectDir, ignoredWatchCommand } = getOptions(opts)
  const { scripts, runScriptCommand } = await getProjectInfo({ projectDir, ignoredWatchCommand })
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

const getProjectInfo = async function ({ projectDir, ignoredWatchCommand }) {
  const { packageJsonPath, npmDependencies, scripts } = await getPackageJsonContent({ projectDir, ignoredWatchCommand })
  const runScriptCommand = await getRunScriptCommand({ projectDir, packageJsonPath })
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
