import { mkdir, writeFile } from 'fs/promises'
import { basename, join, resolve } from 'path'

import { findServerEntry } from '@netlify/zip-it-and-ship-it'

import { addErrorInfo } from '../../error/info.js'
import { type FeatureFlags } from '../../core/feature_flags.js'

// Where a site's server lives, relative to the package root.
export const SERVER_DIRECTORY = 'netlify/server'

export const useServerAsFunction = (featureFlags?: FeatureFlags): boolean =>
  featureFlags?.netlify_build_server_entry === true

export const useServerStandalone = (featureFlags?: FeatureFlags): boolean =>
  featureFlags?.netlify_build_server_standalone === true

export interface ServerEntry {
  // Path of the user's server entrypoint.
  entryPath: string

  // Root of the package the server belongs to.
  packageRoot: string

  // Entrypoint path relative to the package root, for logging.
  relativeEntryPath: string
}

// Finds the user's server entrypoint.
export const getServerEntry = async ({
  buildDir,
  packagePath,
}: {
  buildDir: string
  packagePath?: string
}): Promise<ServerEntry | undefined> => {
  const packageRoot = resolve(buildDir, packagePath ?? '')

  let entryPath: string | undefined

  try {
    entryPath = await findServerEntry(join(packageRoot, SERVER_DIRECTORY))
  } catch (error) {
    addErrorInfo(error, { type: 'resolveConfig' })

    throw error
  }

  if (entryPath === undefined) {
    return undefined
  }

  return {
    entryPath,
    packageRoot,
    relativeEntryPath: `${SERVER_DIRECTORY}/${basename(entryPath)}`,
  }
}

// Everything below carries a server through the functions plumbing, which is
// how it was deployed before it stood on its own. It goes away once no deploy
// is built with the function channel on.

const SERVER_FUNCTION_NAME = '___netlify-server'
const SERVER_SHIM_DIR = '.netlify/server-entry'

// Gives the server the deploy surface of a function without touching the user's
// code, so that it can be bundled and uploaded as one.
const getShimContents = (entryPath: string) => `import * as server from ${JSON.stringify(entryPath)}

export default server.default ?? server
export const shutdown = server.shutdown

export const config = {
  name: "Netlify Server",
  generator: "netlify-server",
  path: "/*",
  preferStatic: true,
}
`

/**
 * Writes the file a server is bundled from when it travels as a function, and
 * returns its path.
 */
export const writeServerShim = async ({ entryPath, packageRoot }: ServerEntry): Promise<string> => {
  const shimDir = join(packageRoot, SERVER_SHIM_DIR)

  await mkdir(shimDir, { recursive: true })

  const shimPath = join(shimDir, `${SERVER_FUNCTION_NAME}.mjs`)

  await writeFile(shimPath, getShimContents(entryPath))

  return shimPath
}
