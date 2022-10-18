import { promisify } from 'util'

import slugify from '@sindresorhus/slugify'
import StatsdClient from 'statsd-client'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// See https://github.com/msiebuhr/node-statsd-client/blob/45a93ee4c94ca72f244a40b06cb542d4bd7c3766/lib/EphemeralSocket.js#L81
const CLOSE_TIMEOUT = 11

// The socket creation is delayed until the first packet is sent. In our
// case, this happens just before `client.close()` is called, which is too
// late and make it not send anything. We need to manually create it using
// the internal API.
export const startClient = async function (host: string, port: number): Promise<StatsdClient> {
  const client = new StatsdClient({ host, port, socketTimeout: 0 })

  // @ts-expect-error using internals :D
  await promisify(client._socket._createSocket.bind(client._socket))()

  return client
}

// UDP packets are buffered and flushed at regular intervals by statsd-client.
// Closing force flushing all of them.
export const closeClient = async function (client: StatsdClient): Promise<void> {
  client.close()

  // statsd-client does not provide a way of knowing when the socket is done
  // closing, so we need to use the following hack.
  await pSetTimeout(CLOSE_TIMEOUT)
  await pSetTimeout(CLOSE_TIMEOUT)
}

// Make sure the timer name does not include special characters.
// For example, the `packageName` of local plugins includes dots.
export const normalizeTagName = function (name: string): string {
  return slugify(name, { separator: '_' })
}
