import { resolve } from 'path'

import { type ServerResult, zipServer } from '@netlify/zip-it-and-ship-it'

import type { FeatureFlags } from '../../core/feature_flags.js'
import { log } from '../../log/logger.js'
import { pathExists } from '../../utils/path_exists.js'
import { getServerEntry, SERVER_DIRECTORY, useServerStandalone } from '../functions/server_entry.js'
import type { CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async function ({
  buildDir,
  constants: { SERVER_DIST },
  featureFlags,
  logs,
  packagePath,
  repositoryRoot,
  systemLog,
}) {
  const serverEntry = await getServerEntry({ buildDir, packagePath })

  if (serverEntry === undefined) {
    return {}
  }

  log(logs, `Netlify Server detected at ${serverEntry.relativeEntryPath}`)

  await zipItAndShipIt.zipServer(serverEntry.entryPath, resolve(buildDir, SERVER_DIST), {
    basePath: buildDir,
    featureFlags,
    repositoryRoot,
    systemLog,
  })

  return {}
}

// The directory can be created by the build command or by a plugin, so this is
// checked when the step is about to run rather than when it is scheduled.
const hasServerDirectory = async function ({
  buildDir,
  featureFlags,
  packagePath,
}: {
  buildDir: string
  featureFlags?: FeatureFlags
  packagePath?: string
}) {
  if (!useServerStandalone(featureFlags)) {
    return false
  }

  return await pathExists(resolve(buildDir, packagePath ?? '', SERVER_DIRECTORY))
}

export const bundleServer = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'server_bundling',
  coreStepName: 'Server bundling',
  coreStepDescription: () => 'Server bundling',
  condition: hasServerDirectory,
}

// Named imports with ES modules cannot be mocked (unlike CommonJS) because they
// are bound at load time, and the tests assert on what reaches
// `zip-it-and-ship-it`.
export const zipItAndShipIt = {
  async zipServer(...args: Parameters<typeof zipServer>): Promise<ServerResult> {
    return await zipServer(...args)
  },
}
