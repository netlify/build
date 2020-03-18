const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')
// eslint-disable-next-line node/no-extraneous-require
const pathExists = require('path-exists')

const pWriteFile = promisify(writeFile)

module.exports = {
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    console.log(await cache.save(id, { move: true }))
    console.log(await pathExists(id))

    console.log(await cache.has(id))
    console.log(await cache.restore(id, { move: true }))
    console.log(await cache.has(id))
    console.log(await pathExists(id))
    await del(id)
  },
}
