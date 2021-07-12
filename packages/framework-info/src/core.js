const pFilter = require('p-filter')

const { usesFramework } = require('./detect')
const { getDevCommands } = require('./dev')
const { FRAMEWORKS } = require('./frameworks/main')
const { getPackageJsonContent } = require('./package')
const { getPlugins } = require('./plugins')
const { getRunScriptCommand } = require('./run_script')

const getContext = (context) => {
  const { pathExists, packageJson, packageJsonPath = '.', nodeVersion } = context

  return { pathExists, packageJson, packageJsonPath, nodeVersion }
}

/**
 * @typedef {object} PollingStrategy
 * @property {'TCP'|'HTTP'} name - Name of the polling strategy. Possible names - TCP,HTTP
 */

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
 * @property {nodeVersion} [nodeVersion] - Node.js version of the runtime environment. Used to recommend Netlify build plugins
 */

/**
 * @typedef {object} Dev
 * @property {string} commands - Dev command. There might be several alternatives or empty
 * @property {number} port - Server port
 * @property {PollingStrategy[]} pollingStrategies - Dev Server polling strategies
 */

/**
 * @typedef {object} Build
 * @property {string} commands - Build command. There might be several alternatives
 * @property {string} directory - Relative path to the directory where files are built
 */

/**
 * @typedef {object} Framework
 * @property {string} id - framework id such as `"gatsby"`
 * @property {string} name - framework name such as `"Gatsby"`
 * @property {string} category - Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @property {Dev} dev - Information about the dev command
 * @property {Build} build - Information about the build command
 * @property {string} staticAssetsDirectory - Directory where the framework stores static assets. Can be `undefined`
 * @property {object} env - Environment variables that should be set when calling the dev command
 * @property {string[]} plugins - A list of recommend Netlify build plugins to install for the framework
 */

/**
 * Return all the frameworks used by a project.
 *
 * @param  {Context} context - Context
 *
 * @returns {Framework[]} frameworks - Frameworks used by a project
 */
const listFrameworks = async function (context) {
  const { pathExists, packageJson, packageJsonPath, nodeVersion } = getContext(context)
  const { npmDependencies, scripts, runScriptCommand } = await getProjectInfo({
    pathExists,
    packageJson,
    packageJsonPath,
  })
  const frameworks = await pFilter(FRAMEWORKS, (framework) => usesFramework(framework, { pathExists, npmDependencies }))
  const frameworkInfos = frameworks.map((framework) =>
    getFrameworkInfo(framework, { scripts, runScriptCommand, nodeVersion }),
  )
  return frameworkInfos
}

/**
 * Return whether a project uses a specific framework
 *
 * @param {string} frameworkId - Id such as `"gatsby"`
 * @param  {Context} [context] - Context
 *
 * @returns {boolean} result - Whether the project uses this framework
 */
const hasFramework = async function (frameworkId, context) {
  const framework = getFrameworkById(frameworkId)
  const { pathExists, packageJson, packageJsonPath } = getContext(context)
  const { npmDependencies } = await getProjectInfo({ pathExists, packageJson, packageJsonPath })
  const result = await usesFramework(framework, { pathExists, npmDependencies })
  return result
}

/**
 * Return some information about a framework used by a project.
 *
 * @param {string} frameworkId - Id such as `"gatsby"`
 * @param  {Context} [context] - Context
 *
 * @returns {Framework} framework - Framework used by a project
 */
const getFramework = async function (frameworkId, context) {
  const framework = getFrameworkById(frameworkId)
  const { pathExists, packageJson, packageJsonPath, nodeVersion } = getContext(context)
  const { scripts, runScriptCommand } = await getProjectInfo({
    pathExists,
    packageJson,
    packageJsonPath,
  })
  const frameworkInfo = getFrameworkInfo(framework, { scripts, runScriptCommand, nodeVersion })
  return frameworkInfo
}

const getFrameworkById = function (frameworkId) {
  const framework = FRAMEWORKS.find(({ id }) => id === frameworkId)
  if (framework === undefined) {
    const frameworkIds = FRAMEWORKS.map((knownFramework) => getFrameworkId(knownFramework))
      .sort()
      .join(', ')
    throw new Error(`Invalid framework "${frameworkId}". It should be one of: ${frameworkIds}`)
  }
  return framework
}

const getFrameworkId = function ({ id }) {
  return id
}

const getProjectInfo = async function ({ pathExists, packageJson, packageJsonPath }) {
  const { npmDependencies, scripts } = await getPackageJsonContent({
    packageJson,
  })
  const runScriptCommand = await getRunScriptCommand({ pathExists, packageJsonPath })
  return { npmDependencies, scripts, runScriptCommand }
}

const getFrameworkInfo = function (
  {
    id,
    name,
    category,
    dev: { command: frameworkDevCommand, port, pollingStrategies },
    build: { command: frameworkBuildCommand, directory },
    staticAssetsDirectory,
    env,
    plugins,
  },
  { scripts, runScriptCommand, nodeVersion },
) {
  const devCommands = getDevCommands({ frameworkDevCommand, scripts, runScriptCommand })
  const recommendedPlugins = getPlugins(plugins, { nodeVersion })
  return {
    id,
    name,
    category,
    dev: { commands: devCommands, port, pollingStrategies },
    build: { commands: [frameworkBuildCommand], directory },
    staticAssetsDirectory,
    env,
    plugins: recommendedPlugins,
  }
}

module.exports = { listFrameworks, hasFramework, getFramework }
