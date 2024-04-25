import { join } from 'path'
import { cwd } from 'process'

import { findUp } from 'find-up'

import { getContext, getPackageJson } from './context.js'
import { listFrameworks as list, hasFramework as has, getFramework as get } from './core.js'
import type { FrameworkName } from './generated/frameworkNames.js'
import type { Framework } from './types.js'

interface Options {
  projectDir?: string
  nodeVersion?: string
}

/**
 * Gets the version of the framework that is installed in a project.
 *
 * This cannot currently be used in the browser at this time, which is why it's defined
 * here rather than in `core.js` as part of the `getFrameworkInfo` method
 */
const getFrameworkVersion = async (projectDir: string, frameworkInfo: Framework): Promise<Framework> => {
  if (!frameworkInfo.package || !frameworkInfo.package.name) {
    return frameworkInfo
  }

  const npmPackage = frameworkInfo.package.name

  // Get path of package.json for the installed framework. We need to traverse up the directories
  // in the event that the project uses something like npm workspaces, and the installed framework package
  // has been hoisted to the root directory of the project (which differs from the directory of the project/application being built)
  const installedFrameworkPath = await findUp(join('node_modules', npmPackage, 'package.json'), { cwd: projectDir })

  if (!installedFrameworkPath) {
    return frameworkInfo
  }

  const { packageJson } = await getPackageJson(installedFrameworkPath)

  return {
    ...frameworkInfo,
    package: {
      name: npmPackage,
      version: packageJson?.version || 'unknown',
    },
  }
}

/**
 * Return all the frameworks used by a project.
 */
export const listFrameworks = async function (opts: Options = {}): Promise<Framework[]> {
  const context = await getContext(opts.projectDir, opts.nodeVersion)
  const frameworkList = await list(context)

  const projectDir = opts && opts.projectDir ? opts.projectDir : cwd()

  const settledPromises = await Promise.allSettled(
    frameworkList.map((framework) => getFrameworkVersion(projectDir, framework)),
  )
  const updatedList = settledPromises.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value
    }

    throw result.reason
  })

  return updatedList
}

/**
 * Return whether a project uses a specific framework
 */
export const hasFramework = async function (frameworkId: FrameworkName, options: Options = {}): Promise<boolean> {
  const context = await getContext(options.projectDir, options.nodeVersion)
  return has(frameworkId, context)
}

/**
 * Return some information about a framework used by a project.
 */
export const getFramework = async function (frameworkId: FrameworkName, options: Options = {}): Promise<Framework> {
  const context = await getContext(options.projectDir, options.nodeVersion)

  return get(frameworkId, context)
}

export const supportedRuntimes = {
  next: { package: '@netlify/plugin-nextjs', skipFlag: 'NETLIFY_NEXT_PLUGIN_SKIP' },
  gatsby: { package: '@netlify/plugin-gatsby', skipFlag: 'NETLIFY_GATSBY_PLUGIN_SKIP' },
}
