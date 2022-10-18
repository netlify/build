import { Buffer } from 'buffer'
import { createSocket } from 'dgram'
import { promisify } from 'util'

import { test, expect, afterAll } from 'vitest'

import { intercept, cleanAll, isMocked, interceptSocketSend } from '../src/main.js'

import { createServer } from './helpers/udp_server.js'

afterAll(() => {
  cleanAll()
})

// Run this set of tests serially as they rely on global state

test('Requiring this module should not monkey patch Socket.send', () => {
  expect(isMocked()).toBe(false)
})

test('Intercepting an address should monkey patch by default and cleanAll should restore it', () => {
  intercept('localhost:1234')
  expect(isMocked()).toBe(true)
  cleanAll()
  expect(isMocked()).toBe(false)
})

test('Intercepting can optionally not start the interception', () => {
  intercept('localhost:1234', { startIntercept: false })
  expect(isMocked()).toBe(false)
  interceptSocketSend()
  expect(isMocked()).toBe(true)
  cleanAll()
  expect(isMocked()).toBe(false)
})

test('Intercepting can optionally allow messages to unknown hosts', async () => {
  const port = '8800'
  const buffer = Buffer.from('123')
  const { server, getMessages } = createServer({ port })

  interceptSocketSend({ allowUnknown: true })
  expect(isMocked()).toBe(true)

  const client: any = createSocket('udp4')
  client.send(buffer, 0, buffer.length, port, 'localhost')
  const msgs = (await getMessages()) as any[]
  expect(msgs[0].toString()).toBe(buffer.toString())

  cleanAll()
  server.close()
  expect(isMocked()).toBe(false)
})

// We can run the next tests in parallel as we use different hosts for each

test('Intercepting should stop after the first datagram received', async () => {
  const buffer = Buffer.from('test')
  const host = encodeURI('some random name')
  const port = '1234'

  const scope = intercept(`${host}:${port}`)
  expect(scope.used).toBe(false)

  const send: any = promisify(createSocket('udp4').send)
  await send(buffer, 0, buffer.length, port, host)
  expect(scope.used).toBe(true)

  await expect(async () => send(buffer, 0, buffer.length, port, host)).rejects.toThrow()
  expect(scope.buffers.length).toBe(1)
  expect((scope.buffers[0] as any).toString()).toBe(buffer.toString())
})

test('If persisted, interception should keep on going', async () => {
  const host = encodeURI('some random name')
  const port = '1234'
  const buffer = Buffer.from('test')

  const scope = intercept(`${host}:${port}`, { persist: true })
  expect(scope.used).toBe(false)

  const send: any = promisify(createSocket('udp4').send)
  await send(buffer, 0, buffer.length, port, host)
  await send(buffer, 0, buffer.length, port, host)

  expect(scope.used).toBe(true)
  expect(scope.buffers.length).toBe(2)
  expect((scope.buffers[0] as any).toString()).toBe(buffer.toString())
  expect((scope.buffers[1] as any).toString()).toBe(buffer.toString())
})

test('Scope.clean should remove that single interception', async () => {
  const host1 = encodeURI('some random name')
  const host2 = `${encodeURI('some random name')}-2`
  const port = '1234'
  const buffer = Buffer.from('test')

  intercept(`${host1}:${port}`)
  const scope2 = intercept(`${host2}:${port}`)

  scope2.clean()

  const send: any = promisify(createSocket('udp4').send)
  await send(buffer, 0, buffer.length, port, host1)
  await expect(async () => send(buffer, 0, buffer.length, port, host2)).rejects.toThrow()
})
