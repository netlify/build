const pFilter = require('p-filter')

const { usesFramework } = require('./detect.js')
const { FRAMEWORKS } = require('./frameworks/main.js')
const { getOptions } = require('./options.js')
const { getPackageJsonContent } = require('./package.js')
const { getRunScriptCommand } = require('./run_script.js')
const { getWatchCommands } = require('./watch.js')

/**
 * Return all the frameworks used by a project.
 *
 * @param  {object} [options] - Options
 * @param  {string} [flags.projectDir=process.cwd()] - Project's directory
 * @param  {string} [flags.ignoredWatchCommand] - When guessing the watch command, ignore `package.json` `scripts` whose value includes this string
 *
 * @returns {object[]} frameworks - Frameworks used by a project
 * @returns {string} frameworks[].name - Name such as `"gatsby"`
 * @returns {string} frameworks[].category -Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @returns {object} frameworks[].watch - Information about the build command, in watch mode.
 * @returns {string[]} frameworks[].watch.commands - Build command, in watch mode. There might be several alternatives
 * @returns {string} frameworks[].publish - Relative path to the directory where files are built
 * @returns {number} frameworks[].port - Server port
 * @returns {object} frameworks[].env - Environment variables that should be set when calling the watch command
 */
const listFrameworks = async function(opts) {
  const { projectDir, ignoredWatchCommand } = getOptions(opts)
  const { npmDependencies, scripts, runScriptCommand } = await getProjectInfo({ projectDir, ignoredWatchCommand })
  const frameworks = await pFilter(FRAMEWORKS, framework => usesFramework(framework, { projectDir, npmDependencies }))
  const frameworkInfos = frameworks.map(framework => getFrameworkInfo(framework, { scripts, runScriptCommand }))
  return frameworkInfos
}

/**
 * Return some information about a framework used by a project.
 *
 * @param  {object} [options] - Options
 * @param  {string} [flags.projectDir=process.cwd()] - Project's directory
 * @param  {string} [flags.ignoredWatchCommand] - When guessing the watch command, ignore `package.json` `scripts` whose value includes this string
 *
 * @returns {object} framework - Framework used by a project
 * @returns {string} framework.name - Name such as `"gatsby"`
 * @returns {string} framework.category -Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @returns {object} framework.watch - Information about the build command, in watch mode.
 * @returns {string[]} framework.watch.commands - Build command, in watch mode. There might be several alternatives
 * @returns {string} framework.publish - Relative path to the directory where files are built
 * @returns {number} framework.port - Server port
 * @returns {object} framework.env - Environment variables that should be set when calling the watch command
 */
const getFramework = async function(frameworkName, opts) {
  const framework = getFrameworkByName(frameworkName)
  const { projectDir, ignoredWatchCommand } = getOptions(opts)
  const { scripts, runScriptCommand } = await getProjectInfo({ projectDir, ignoredWatchCommand })
  const frameworkInfo = getFrameworkInfo(framework, { scripts, runScriptCommand })
  return frameworkInfo
}

const getFrameworkByName = function(frameworkName) {
  const framework = FRAMEWORKS.find(({ name }) => name === frameworkName)
  if (framework === undefined) {
    const frameworkNames = FRAMEWORKS.map(getFrameworkName).join(', ')
    throw new Error(`Invalid framework "${frameworkName}". It should be one of: ${frameworkNames}`)
  }
  return framework
}

const getFrameworkName = function({ name }) {
  return name
}

const getProjectInfo = async function({ projectDir, ignoredWatchCommand }) {
  const { packageJsonPath, npmDependencies, scripts } = await getPackageJsonContent({ projectDir, ignoredWatchCommand })
  const runScriptCommand = await getRunScriptCommand({ projectDir, packageJsonPath })
  return { npmDependencies, scripts, runScriptCommand }
}

const getFrameworkInfo = function(
  { name, category, watch: { command: frameworkWatchCommand, port }, publish, env },
  { scripts, runScriptCommand }
) {
  const watchCommands = getWatchCommands({ frameworkWatchCommand, scripts, runScriptCommand })
  return { name, category, watch: { commands: watchCommands }, publish, port, env }
}

module.exports = { listFrameworks, getFramework }
