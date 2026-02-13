import net, { NetConnectOpts } from 'net'
import { normalize, resolve, relative } from 'path'
import { promisify } from 'util'

import { pEvent } from 'p-event'

import { addErrorInfo } from '../../error/info.js'
import { runsAfterDeploy } from '../../plugins/events.js'
import { addAsyncErrorMessage } from '../../utils/errors.js'
import type { NetlifyPluginConstants } from '../../core/constants.js'

/**
 * Error types the Buildbot server sends, see:
 * - https://github.com/netlify/buildbot/blob/934981c85c779610e15ce549846b0bea212b283e/bot/deploy.go#L107
 * - https://github.com/netlify/buildbot/blob/934981c85c779610e15ce549846b0bea212b283e/bot/build_error.go#L5-L9
 */
type ErrorType = 'none' | 'user' | 'system'

/**
 * The response we get back from the Buildbot deploy server, see:
 * - https://github.com/netlify/buildbot/blob/934981c85c779610e15ce549846b0bea212b283e/deployserver/deploy_server.go#L20-L23
 * - https://github.com/netlify/buildbot/blob/934981c85c779610e15ce549846b0bea212b283e/deployserver/deploy_server.go#L123-L129
 */
type BuildbotResponse = {
  succeeded: boolean
  values?: {
    error?: string
    code?: string
    error_type?: ErrorType
  }
}

/**
 * Actions supported by the deploy server.
 */
enum Action {
  /**
   * Initiate the deploy.
   */
  DeploySite = 'deploySite',
  /**
   * Initiate the deploy, wait and hand back control to `@netlify/build` once the site is live.
   */
  DeploySiteAndWait = 'deploySiteAndAwaitLive',
}

/**
 * Request format for the Buildbot deploy server, see:
 * - https://github.com/netlify/buildbot/blob/934981c85c779610e15ce549846b0bea212b283e/deployserver/deploy_server.go#L15-L18
 */
type BuildRequest = {
  action: Action
  deployDir?: string
  environment: { key: string; value: string; isSecret: boolean; scopes: string[] }[]
}

/**
 * Creates the Buildbot IPC client we use to initiate the deploy
 */
export const createBuildbotClient = function (buildbotServerSocket: string) {
  const connectionOpts = getConnectionOpts(buildbotServerSocket)
  const client = net.createConnection(connectionOpts)
  return client
}

/**
 * Windows does not support Unix sockets well, so we also support `host:port`
 */
const getConnectionOpts = function (buildbotServerSocket: string): NetConnectOpts {
  if (!buildbotServerSocket.includes(':')) {
    return { path: buildbotServerSocket }
  }

  const [host, port] = buildbotServerSocket.split(':')
  return { host, port: Number(port) }
}

/**
 * Emits the connect event
 */
export const connectBuildbotClient = addAsyncErrorMessage(async (client: net.Socket) => {
  await pEvent(client, 'connect')
}, 'Could not connect to buildbot')

/**
 * Closes the buildbot client and its connection
 */
export const closeBuildbotClient = async function (client: net.Socket) {
  if (client.destroyed) {
    return
  }

  await promisify(client.end.bind(client))()
}

const writePayload = addAsyncErrorMessage(async (buildbotClient: net.Socket, payload: BuildRequest) => {
  await promisify(buildbotClient.write.bind(buildbotClient))(JSON.stringify(payload))
}, 'Could not send payload to buildbot')

const getNextParsedResponsePromise = addAsyncErrorMessage<BuildbotResponse>(async (buildbotClient: net.Socket) => {
  const data = await pEvent<'data', string>(buildbotClient, 'data')
  return JSON.parse(data) as BuildbotResponse
}, 'Invalid response from buildbot')

/**
 * Initates the deploy with the given buildbot client
 */
export const deploySiteWithBuildbotClient = async function ({
  client,
  environment,
  events,
  buildDir,
  repositoryRoot,
  constants,
}: {
  client: net.Socket
  environment: { key: string; value: string; isSecret: boolean; scopes: string[] }[]
  events: string[]
  buildDir: string
  repositoryRoot: string
  constants: NetlifyPluginConstants
}) {
  const [response] = await Promise.all([
    getNextParsedResponsePromise(client),
    writePayload(client, {
      action: shouldWaitForPostProcessing(events) ? Action.DeploySiteAndWait : Action.DeploySite,
      deployDir: getDeployDir({ buildDir, repositoryRoot, constants }),
      environment,
    }),
  ])

  if (!response.succeeded) {
    const { error, code, error_type } = response?.values || {}
    return handleDeployError(error, code, error_type)
  }
}

/**
 * The file paths in the buildbot are relative to the repository root.
 * However, the file paths in Build plugins, including `constants.PUBLISH_DIR`
 * are relative to the build directory, which is different when there is a
 * base directory. This converts it.
 * We need to call `normalize()` in case the publish directory is the
 * repository root, so `deployDir` is "." not ""
 */
const getDeployDir = function ({ buildDir, repositoryRoot, constants: { PUBLISH_DIR } }) {
  const absolutePublishDir = resolve(buildDir, PUBLISH_DIR)
  const relativePublishDir = relative(repositoryRoot, absolutePublishDir)
  const deployDir = normalize(relativePublishDir)
  return deployDir
}

/**
 * We distinguish between user errors and system errors during deploys
 */
const handleDeployError = function (error?: string, errorCode?: string, errorType?: ErrorType) {
  if (errorCode !== undefined) {
    const err = new Error(`Deploy did not succeed with HTTP Error ${errorCode}: ${error}`)
    if (errorCode.startsWith('5')) {
      const errorInfo = { type: 'deployInternal', location: { statusCode: errorCode } }
      addErrorInfo(err, errorInfo)
      throw err
    }
    const errorInfo = { type: 'deploy', location: { statusCode: errorCode } }
    addErrorInfo(err, errorInfo)
    throw err
  }

  const err = new Error(`Deploy did not succeed: ${error}`)
  const errorInfo =
    errorType === 'user' ? { type: 'resolveConfig' } : { type: 'coreStep', location: { coreStepName: 'Deploy site' } }
  addErrorInfo(err, errorInfo)
  throw err
}

/**
 * We only wait for post-processing (last stage before site deploy) if the build
 * has some plugins that do post-deploy logic
 */
const shouldWaitForPostProcessing = function (events: string[]) {
  return events.some(hasPostDeployLogic)
}

const hasPostDeployLogic = function (event: string) {
  return runsAfterDeploy(event)
}
