import { Buffer } from 'buffer'
import { createSocket } from 'dgram'
import { promisify } from 'util'

import test from 'ava'

import { intercept, cleanAll, isMocked, interceptSocketSend } from '../src/main.js'

import { createServer } from './helpers/udp_server.js'

test.after(() => {
  cleanAll()
})

// Run this set of tests serially as they rely on global state

test.serial('Requiring this module should not monkey patch Socket.send', (t) => {
  t.false(isMocked())
})

test.serial('Intercepting an address should monkey patch by default and cleanAll should restore it', (t) => {
  intercept('localhost:1234')
  t.true(isMocked())
  cleanAll()
  t.false(isMocked())
})

test.serial('Intercepting can optionally not start the interception', (t) => {
  intercept('localhost:1234', { startIntercept: false })
  t.false(isMocked())
  interceptSocketSend()
  t.true(isMocked())
  cleanAll()
  t.false(isMocked())
})

test.serial('Intercepting can optionally allow messages to unknown hosts', async (t) => {
  const port = '8800'
  const buffer = Buffer.from('123')
  const { server, getMessages } = createServer({ port })

  interceptSocketSend({ allowUnknown: true })
  t.true(isMocked())

  const client: any = createSocket('udp4')
  client.send(buffer, 0, buffer.length, port, 'localhost')
  const msgs = await getMessages()
  t.is(msgs[0].toString(), buffer.toString())

  cleanAll()
  server.close()
  t.false(isMocked())
})

// We can run the next tests in parallel as we use different hosts for each

test('Intercepting should stop after the first datagram received', async (t) => {
  const buffer = Buffer.from('test')
  const host = encodeURI(t.title)
  const port = '1234'

  const scope = intercept(`${host}:${port}`)
  t.false(scope.used)

  const send: any = promisify(createSocket('udp4').send)
  await send(buffer, 0, buffer.length, port, host)
  t.true(scope.used)

  await t.throwsAsync(async () => await send(buffer, 0, buffer.length, port, host))
  t.is(scope.buffers.length, 1)
  t.is(scope.buffers[0].toString(), buffer.toString())
})

test('If persisted, interception should keep on going', async (t) => {
  const host = encodeURI(t.title)
  const port = '1234'
  const buffer = Buffer.from('test')

  const scope = intercept(`${host}:${port}`, { persist: true })
  t.false(scope.used)

  const send: any = promisify(createSocket('udp4').send)
  await send(buffer, 0, buffer.length, port, host)
  await send(buffer, 0, buffer.length, port, host)

  t.true(scope.used)
  t.is(scope.buffers.length, 2)
  t.is(scope.buffers[0].toString(), buffer.toString())
  t.is(scope.buffers[1].toString(), buffer.toString())
})

test('Scope.clean should remove that single interception', async (t) => {
  const host1 = encodeURI(t.title)
  const host2 = `${encodeURI(t.title)}-2`
  const port = '1234'
  const buffer = Buffer.from('test')

  intercept(`${host1}:${port}`)
  const scope2 = intercept(`${host2}:${port}`)

  scope2.clean()

  const send: any = promisify(createSocket('udp4').send)
  await send(buffer, 0, buffer.length, port, host1)
  await t.throwsAsync(async () => await send(buffer, 0, buffer.length, port, host2))
})
