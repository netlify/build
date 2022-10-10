# Nock UDP

Mock outgoing UDP requests. Useful for testing purposes mostly. Based on
[node-mock-udp](https://github.com/mattrobenolt/node-mock-udp).

## Install

```bash
npm install @netlify/nock-udp
```

## Usage

```js
const { Buffer } = require('buffer')

const { intercept, cleanAll } = require('@netlify/nock-udp')

const buffer = Buffer.from('test')
const host = 'localhost'
const port = '1234'

// const opts = {
//   persist: false,  // Persist the interception for more than one message, defaults to false
//   startIntercept: true  // Start overriding Socket.prototype.send, defaults to true
//   allowUnknown: false  // If `startIntercept = true` allow messages to addresses which aren't intercepted, defaults to false
// }
const opts = {}
const scope = intercept(`${host}:${port}`, opts)

console.log(scope.used)
// false

const client = createSocket('udp4')
client.send(buffer, 0, buffer.length, port, host)

console.log(scope.used)
// true
console.log(scope.buffers[0].toString())
// test

// stop intercepting this address
scope.clean()

// clean all the interceptions and restore the original Socket.prototype.send
cleanAll()
```

### Other utility methods

```js
const { Buffer } = require('buffer')

const { restoreSocketSend, interceptSocketSend, isMocked } = require('@netlify/nock-udp')

// check if Socket.prototype.send is currently overridden
console.log(isMocked())
// false

// override Socket.prototype.send with our custom method and start using the interceptors (used by `intercept` if `startIntercept = true`)
// optionally allow for requests to addresses which are not intercepted
interceptSocketSend({ allowUnknown: false })
console.log(isMocked())
// true

// restore the original Socket.prototype.send while keeping the current interceptors state
restoreSocketSend()
console.log(isMocked())
// false
```

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
