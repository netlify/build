import { mkdir, readdir, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

import { pathExists } from '../../utils/path_exists.js'

import { addErrorInfo } from '../../error/info.js'
import { type FeatureFlags } from '../../core/feature_flags.js'

const SERVER_ENTRY_DIR = 'netlify/server'
const SERVER_ENTRY_BASENAMES = new Set(['index.js', 'index.mjs', 'index.ts', 'index.mts'])

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
  featureFlags,
}: {
  buildDir: string
  packagePath?: string
  featureFlags?: FeatureFlags
}): Promise<ServerEntry | undefined> => {
  if (!featureFlags?.netlify_build_server_entry) {
    return undefined
  }

  const packageRoot = resolve(buildDir, packagePath ?? '')
  const serverDir = join(packageRoot, SERVER_ENTRY_DIR)

  if (!(await pathExists(serverDir))) {
    return undefined
  }

  const candidates = (await readdir(serverDir)).filter((name) => SERVER_ENTRY_BASENAMES.has(name)).sort()

  if (candidates.length === 0) {
    return undefined
  }

  if (candidates.length > 1) {
    const error = new Error(
      `Found multiple server entrypoints in ${SERVER_ENTRY_DIR} (${candidates.join(
        ', ',
      )}). A site can have one server only.`,
    )
    addErrorInfo(error, { type: 'resolveConfig' })
    throw error
  }

  return {
    entryPath: join(serverDir, candidates[0]),
    packageRoot,
    relativeEntryPath: `${SERVER_ENTRY_DIR}/${candidates[0]}`,
  }
}

// Everything below carries a server through the functions plumbing, which is
// how it was deployed before it stood on its own. It goes away with the
// `netlify_build_server_standalone` flag.

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
