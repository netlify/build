const { getContext } = require('./context')
const { listFrameworks: list, hasFramework: has, getFramework: get } = require('./core.js')

/**
 * @typedef {object} Options
 * @property {string} [projectDir=process.cwd()] - Project's directory
 * @property {string} [nodeVersion=process.version] - Node.js version of the runtime environment. Used to recommend Netlify build plugins
 */

/**
 * @typedef {object} Dev
 * @property {string} commands - Dev command. There might be several alternatives or empty
 * @property {number} port - Server port
 */

/**
 * @typedef {object} Build
 * @property {string} commands - Build command. There might be several alternatives
 * @property {string} directory - Relative path to the directory where files are built
 */

/**
 * @typedef {object} Framework
 * @property {string} id - Id such as `"gatsby"`
 * @property {string} category - Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @property {Dev} dev - Information about the dev command
 * @property {Build} build - Information about the build command
 * @property {object} env - Environment variables that should be set when calling the dev command
 * @property {string[]} plugins - A list of recommend Netlify build plugins to install for the framework
 */

/**
 * Return all the frameworks used by a project.
 *
 * @param  {Options} options - Options
 *
 * @returns {Framework[]} frameworks - Frameworks used by a project
 */
const listFrameworks = async function (opts) {
  const context = await getContext(opts)
  return await list(context)
}

/**
 * Return whether a project uses a specific framework
 *
 * @param {string} frameworkId - Id such as `"gatsby"`
 * @param  {Options} [options] - Context
 *
 * @returns {boolean} result - Whether the project uses this framework
 */
const hasFramework = async function (frameworkId, options) {
  const context = await getContext(options)
  return await has(frameworkId, context)
}

/**
 * Return some information about a framework used by a project.
 *
 * @param {string} frameworkId - Id such as `"gatsby"`
 * @param  {Context} [context] - Context
 *
 * @returns {Framework} framework - Framework used by a project
 */
const getFramework = async function (frameworkId, options) {
  const context = await getContext(options)
  return await get(frameworkId, context)
}

module.exports = { listFrameworks, hasFramework, getFramework }
