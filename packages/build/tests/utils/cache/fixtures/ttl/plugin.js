const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')
// eslint-disable-next-line node/no-extraneous-require
const pathExists = require('path-exists')

const pWriteFile = promisify(writeFile)
const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    console.log(await cache.save(id, { ttl: 5 }))
    console.log(await cache.has(id))
    await pSetTimeout(10e3)
    console.log(await cache.has(id))

    await del(id)
    console.log(await cache.restore(id))
    console.log(await pathExists(id))
  },
}
