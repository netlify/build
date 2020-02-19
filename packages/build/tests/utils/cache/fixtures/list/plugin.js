const { writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    console.log(await cache.save(id))
    console.log((await cache.list())[0] === join(__dirname, id))
    console.log(await cache.remove(id))
    await del(id)
  },
}
