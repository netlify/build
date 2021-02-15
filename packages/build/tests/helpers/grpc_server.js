'use strict'

const { promisify, callbackify } = require('util')

const {
  Server,
  ServerCredentials: { createInsecure: createCredentials },
} = require('@grpc/grpc-js')
const { load } = require('@grpc/proto-loader')
// TODO: replace with `Object.fromEntries()` after dropping Node <12.0.0
const fromEntries = require('@ungap/from-entries')
const getPort = require('get-port')
const { tmpName } = require('tmp-promise')

// Start a gRPC server to mock calls.
const startGrpcServer = async function ({ proto, serviceName, rpcNames, response, useUnixSocket = true } = {}) {
  const requests = []
  const server = new Server()

  await addService({ server, proto, serviceName, rpcNames, requests, response })

  const address = await startServer(server, useUnixSocket)
  const stopServer = promisify(server.tryShutdown.bind(server))
  return { address, requests, stopServer }
}

const getService = async function (proto, serviceName) {
  const serviceDefinition = await load(proto)
  const service = serviceDefinition[serviceName]
  return service
}

const addService = async function ({ server, proto, serviceName, rpcNames, requests, response }) {
  const service = await getService(proto, serviceName)
  const rpcs = fromEntries(rpcNames.map((rpcName) => getRpcHandler({ rpcName, requests, response })))
  server.addService(service, rpcs)
}

const getRpcHandler = function ({ rpcName, requests, response }) {
  return [rpcName, callbackify(mockRpcHandler.bind(undefined, { requests, response }))]
}

// `async` is needed due to callbackify()
// eslint-disable-next-line require-await
const mockRpcHandler = async function ({ requests, response }, { request }) {
  requests.push(request)
  return response
}

const startServer = async function (server, useUnixSocket) {
  const { address, serverAddress } = await getAddress(useUnixSocket)
  await promisify(server.bindAsync.bind(server))(serverAddress, createCredentials())
  server.start()
  return address
}

const getAddress = async function (useUnixSocket) {
  if (useUnixSocket) {
    const address = await tmpName()
    return { address, serverAddress: `unix:${address}` }
  }

  const port = await getPort()
  const address = `localhost:${port}`
  return { address, serverAddress: address }
}

module.exports = { startGrpcServer }
