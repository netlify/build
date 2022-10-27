import { join } from 'path'
import { cwd, chdir } from 'process'

import { findUp } from 'find-up'

import { getContext, getPackageJson } from './context.js'
import { listFrameworks as list, hasFramework as has, getFramework as get } from './core.js'

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
 * @typedef {object} FrameworkPackage
 * @property {string} name - The name of the package. e.g: 'gatsby'
 * @property {string} version - The version of the installed package as found in the package.json. Is set to 'unknown' by default.
 */

/**
 * @typedef {object} Framework
 * @property {string} id - Id such as `"gatsby"`
 * @property {string} category - Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`
 * @property {FrameworkPackage} package - Information about the framework's underlying package
 * @property {Dev} dev - Information about the dev command
 * @property {Build} build - Information about the build command
 * @property {object} env - Environment variables that should be set when calling the dev command
 * @property {string[]} plugins - A list of recommend Netlify build plugins to install for the framework
 */

/**
 * Gets the version of the framework that is installed in a project.
 *
 * This cannot currently be used in the browser at this time, which is why it's defined
 * here rather than in `core.js` as part of the `getFrameworkInfo` method
 *
 * @param {string} projectDir - Project directory
 * @param {Framework} frameworkInfo - Information about the framework as detected by `getFrameworkInfo`
 *
 * @returns {Promise<Framework>}
 */
const getFrameworkVersion = async (projectDir, frameworkInfo) => {
  // Need to change the CWD to the project directory in order to make sure we find and use the correct
  // package.json
  const originalCwd = cwd()
  const returnToOriginalDirectory = () => {
    chdir(originalCwd)
  }
  chdir(projectDir)

  const npmPackage = frameworkInfo.package.name

  // Get path of package.json for the installed framework. We need to traverse up the directories
  // in the event that the project uses something like npm workspaces, and the installed framework package
  // has been hoisted to the root directory of the project (which differs from the directory of the project/application being built)
  const installedFrameworkPath = await findUp(join('node_modules', npmPackage, 'package.json'))
  const { packageJson } = await getPackageJson(installedFrameworkPath)

  returnToOriginalDirectory()

  return {
    ...frameworkInfo,
    package: {
      name: frameworkInfo.package.name,
      version: packageJson.version || 'unknown',
    },
  }
}

/**
 * Return all the frameworks used by a project.
 *
 * @param  {Options} options - Options
 *
 * @returns {Framework[]} frameworks - Frameworks used by a project
 */
export const listFrameworks = async function (opts) {
  const context = await getContext(opts)
  const frameworkList = await list(context)

  const projectDir = opts && opts.projectDir ? opts.projectDir : cwd()

  const settledPromises = await Promise.allSettled(
    frameworkList.map((framework) => getFrameworkVersion(projectDir, framework)),
  )
  const updatedList = settledPromises.map((result) => result.value)

  return updatedList
}

/**
 * Return whether a project uses a specific framework
 *
 * @param {string} frameworkId - Id such as `"gatsby"`
 * @param  {Options} [options] - Context
 *
 * @returns {boolean} result - Whether the project uses this framework
 */
export const hasFramework = async function (frameworkId, options) {
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
export const getFramework = async function (frameworkId, options) {
  const context = await getContext(options)
  return await get(frameworkId, context)
}
