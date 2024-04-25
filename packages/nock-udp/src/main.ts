import { Socket } from 'dgram'

const originalSocketSend = Socket.prototype.send

let intercepts = {}

const createScope = function (address, { persist = false } = {}) {
  return {
    used: false,
    persist,
    buffers: [],
    offset: 0,
    length: 0,
    address,
    clean: () => {
      delete intercepts[address]
    },
  }
}

const validateIncomingMsg = function (buffer, offset, length, address) {
  if (offset >= buffer.length) throw new Error('Offset into buffer too large')

  if (offset + length > buffer.length) throw new Error('Offset + length beyond buffer length')

  if (!intercepts[address]) throw new Error(`Request sent to unmocked path: ${address}`)
}

const getMockSocketSend = function ({ allowUnknown = false } = {}) {
  const mockSocketSend = function (this: Socket, buffer, offset, length, port, host, callback) {
    const address = `${host}:${port}`
    if (allowUnknown && !intercepts[address]) {
      // We allow extraneous connections, fallback to original use

      originalSocketSend.call(this, buffer, offset, length, port, host, callback)
      return
    }

    validateIncomingMsg(buffer, offset, length, address)

    const newBuffer = buffer.slice(offset, offset + length)

    const scope = intercepts[address]
    scope.used = true
    scope.buffers.push(newBuffer)
    scope.offset = offset
    scope.length = length

    if (!scope.persist) delete intercepts[address]

    if (callback) return callback(null, length)
  }

  mockSocketSend.mocked = true

  return mockSocketSend
}

export const isMocked = function () {
  return Boolean((Socket.prototype.send as any).mocked)
}

export const intercept = (address, { persist = false, startIntercept = true, allowUnknown = false } = {}) => {
  const scope = createScope(address, { persist })
  intercepts[address] = scope
  if (!isMocked() && startIntercept) interceptSocketSend({ allowUnknown })
  return scope
}

export const cleanAll = function ({ stopIntercept = true } = {}) {
  intercepts = {}
  if (isMocked() && stopIntercept) restoreSocketSend()
}

export const restoreSocketSend = function () {
  Socket.prototype.send = originalSocketSend
}

export const interceptSocketSend = function ({ allowUnknown }: any = {}) {
  ;(Socket.prototype.send as any) = getMockSocketSend({ allowUnknown })
}
