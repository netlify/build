import { mkdir, rm } from 'fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'path'

import { type ServerResult, zipServer } from '@netlify/zip-it-and-ship-it'

import type { FeatureFlags } from '../../core/feature_flags.js'
import { addErrorInfo } from '../../error/info.js'
import { log } from '../../log/logger.js'
import { pathExists } from '../../utils/path_exists.js'
import { getZisiFeatureFlags } from '../functions/feature_flags.js'
import { getServerEntry, SERVER_DIRECTORY, useServerStandalone } from '../functions/server_entry.js'
import type { CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async function ({
  buildDir,
  constants: { SERVER_DIST },
  featureFlags,
  logs,
  netlifyConfig,
  packagePath,
  repositoryRoot,
  systemLog,
}) {
  const serverEntry = await getServerEntry({ buildDir, packagePath })

  if (serverEntry === undefined) {
    return {}
  }

  log(logs, `Netlify Server detected at ${serverEntry.relativeEntryPath}`)

  const serverInPublishDir = relative(
    resolve(buildDir, netlifyConfig.build.publish),
    resolve(serverEntry.packageRoot, SERVER_DIRECTORY),
  )
  const publishesServerSource = !isAbsolute(serverInPublishDir) && serverInPublishDir.split(sep)[0] !== '..'
  const { publishOrigin } = netlifyConfig.build as { publishOrigin?: string }

  if (publishesServerSource && publishOrigin !== 'default') {
    const error = new Error(
      `The publish directory contains the Netlify Server source in ${SERVER_DIRECTORY}, which would be deployed as static files. Set build.publish to a directory that contains only static files.`,
    )

    addErrorInfo(error, { type: 'resolveConfig' })

    throw error
  }

  await zipItAndShipIt.zipServer(serverEntry.entryPath, resolve(buildDir, SERVER_DIST), {
    basePath: buildDir,
    config: netlifyConfig.server,
    featureFlags: getZisiFeatureFlags(featureFlags ?? {}),
    repositoryRoot,
    systemLog,
  })

  if (!publishesServerSource) {
    return {}
  }

  const emptyPublishDir = join(packagePath ?? '', EMPTY_PUBLISH_DIRECTORY)

  await rm(resolve(buildDir, emptyPublishDir), { recursive: true, force: true })
  await mkdir(resolve(buildDir, emptyPublishDir), { recursive: true })

  log(
    logs,
    'No publish directory is set, so no static files were deployed and Netlify Server handles every path. To serve static files, put them in a directory such as public/ and set build.publish to it.',
  )

  const keys = ['build', 'publish']

  return {
    configMutations: [{ keys, keysString: keys.join('.'), value: emptyPublishDir, event: 'onBuild' }],
  }
}

const EMPTY_PUBLISH_DIRECTORY = '.netlify/server-publish'

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
