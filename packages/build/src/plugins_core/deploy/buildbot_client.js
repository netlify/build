import net from 'net'
import { normalize, resolve, relative } from 'path'
import { promisify } from 'util'

import { pEvent } from 'p-event'

import { addErrorInfo } from '../../error/info.js'
import { runsAfterDeploy } from '../../plugins/events.js'
import { addAsyncErrorMessage } from '../../utils/errors.js'

export const createBuildbotClient = function (buildbotServerSocket) {
  const connectionOpts = getConnectionOpts(buildbotServerSocket)
  const client = net.createConnection(connectionOpts)
  return client
}

// Windows does not support Unix sockets well, so we also support `host:port`
const getConnectionOpts = function (buildbotServerSocket) {
  if (!buildbotServerSocket.includes(':')) {
    return { path: buildbotServerSocket }
  }

  const [host, port] = buildbotServerSocket.split(':')
  return { host, port }
}

const eConnectBuildbotClient = async function (client) {
  await pEvent(client, 'connect')
}

export const connectBuildbotClient = addAsyncErrorMessage(eConnectBuildbotClient, 'Could not connect to buildbot')

export const closeBuildbotClient = async function (client) {
  if (client.destroyed) {
    return
  }

  await promisify(client.end.bind(client))()
}

const cWritePayload = async function (buildbotClient, payload) {
  await promisify(buildbotClient.write.bind(buildbotClient))(JSON.stringify(payload))
}

const writePayload = addAsyncErrorMessage(cWritePayload, 'Could not send payload to buildbot')

const cGetNextParsedResponsePromise = async function (buildbotClient) {
  const data = await pEvent(buildbotClient, 'data')
  return JSON.parse(data)
}

const getNextParsedResponsePromise = addAsyncErrorMessage(
  cGetNextParsedResponsePromise,
  'Invalid response from buildbot',
)

export const deploySiteWithBuildbotClient = async function ({ client, events, buildDir, repositoryRoot, constants }) {
  const action = shouldWaitForPostProcessing(events) ? 'deploySiteAndAwaitLive' : 'deploySite'
  const deployDir = getDeployDir({ buildDir, repositoryRoot, constants })
  const payload = { action, deployDir }

  const [{ succeeded, values: { error, error_type: errorType } = {} }] = await Promise.all([
    getNextParsedResponsePromise(client),
    writePayload(client, payload),
  ])

  if (!succeeded) {
    return handleDeployError(error, errorType)
  }
}

// The file paths in the buildbot are relative to the repository root.
// However, the file paths in Build plugins, including `constants.PUBLISH_DIR`
// are relative to the build directory, which is different when there is a
// base directory. This converts it.
// We need to call `normalize()` in case the publish directory is the
// repository root, so `deployDir` is "." not ""
const getDeployDir = function ({ buildDir, repositoryRoot, constants: { PUBLISH_DIR } }) {
  const absolutePublishDir = resolve(buildDir, PUBLISH_DIR)
  const relativePublishDir = relative(repositoryRoot, absolutePublishDir)
  const deployDir = normalize(relativePublishDir)
  return deployDir
}

// We distinguish between user errors and system errors during deploys
const handleDeployError = function (error, errorType) {
  const errorA = new Error(`Deploy did not succeed: ${error}`)
  const errorInfo =
    errorType === 'user' ? { type: 'resolveConfig' } : { type: 'coreStep', location: { coreStepName: 'Deploy site' } }
  addErrorInfo(errorA, errorInfo)
  throw errorA
}

// We only wait for post-processing (last stage before site deploy) if the build
// has some plugins that do post-deploy logic
const shouldWaitForPostProcessing = function (events) {
  return events.some(hasPostDeployLogic)
}

const hasPostDeployLogic = function (event) {
  return runsAfterDeploy(event)
}
