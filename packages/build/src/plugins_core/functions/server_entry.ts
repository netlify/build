import { mkdir, readdir, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

import { pathExists } from 'path-exists'

import { addErrorInfo } from '../../error/info.js'
import { type FeatureFlags } from '../../core/feature_flags.js'

export const SERVER_ENTRY_FUNCTION_NAME = '___netlify-server'
const SERVER_ENTRY_DIR = 'netlify/server'
const SERVER_ENTRY_BASENAMES = new Set(['index.js', 'index.mjs', 'index.ts', 'index.mts'])
const SERVER_SHIM_DIR = '.netlify/server-entry'

export interface ServerEntry {
  // Path of the user's server entrypoint.
  entryPath: string

  // Path of the generated shim, ready to be bundled as a generated function.
  shimPath: string

  // Entrypoint path relative to the package root, for logging.
  relativeEntryPath: string
}

// Finds the user's server entrypoint and materializes the function entry it is
// deployed as.
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

  const entryPath = join(serverDir, candidates[0])
  const shimDir = join(packageRoot, SERVER_SHIM_DIR)
  const shimPath = join(shimDir, `${SERVER_ENTRY_FUNCTION_NAME}.mjs`)

  await mkdir(shimDir, { recursive: true })
  await writeFile(shimPath, getShimContents(entryPath))

  return {
    entryPath,
    shimPath,
    relativeEntryPath: join(SERVER_ENTRY_DIR, candidates[0]),
  }
}

// The shim gives the server the deploy surface of a function without touching
// the user's code.
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
