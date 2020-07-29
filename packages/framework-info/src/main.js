const process = require('process')

const pFilter = require('p-filter')

const { getCommand } = require('./command.js')
const { usesFramework } = require('./detect.js')
const { FRAMEWORKS } = require('./frameworks/main.js')
const { getPackageJsonContent } = require('./package.js')
const { getRunScriptCommand } = require('./run_script.js')

/**
 * Return all the frameworks used by a project.
 *
 * @param  {object} [options] - Options
 * @param  {string} [flags.projectDir=process.cwd()] - Project's directory
 * @param  {string} [flags.ignoredCommand] - When guessing the build command, ignore `package.json` `scripts` whose command includes this string
 *
 * @returns {object[]} frameworks - Frameworks used by a project
 * @returns {string} frameworks[].name - Name such as `"gatsby"`
 * @returns {string} frameworks[].category -Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @returns {string[]} frameworks[].commands - Build command
 * @returns {string} frameworks[].publish - Relative path to the directory where files are built
 * @returns {number} frameworks[].port - Server port
 * @returns {object} frameworks[].env - Environment variables that should be set when calling the build command
 */
const listFrameworks = async function({ projectDir = process.cwd(), ignoredCommand } = {}) {
  const { packageJsonPath, npmDependencies, scripts } = await getPackageJsonContent({ projectDir, ignoredCommand })
  const runScriptCommand = await getRunScriptCommand({ projectDir, packageJsonPath })
  const frameworks = await pFilter(FRAMEWORKS, framework => usesFramework(framework, { projectDir, npmDependencies }))
  const frameworksA = frameworks.map(framework => getFramework(framework, { scripts, runScriptCommand }))
  return frameworksA
}

const getFramework = function(
  { name, category, command: frameworkCommand, packageScripts: frameworkScripts, publish, port, env },
  { scripts, runScriptCommand }
) {
  const command = getCommand({ frameworkCommand, frameworkScripts, scripts, runScriptCommand })
  return { name, category, command, publish, port, env }
}

module.exports = { listFrameworks }
