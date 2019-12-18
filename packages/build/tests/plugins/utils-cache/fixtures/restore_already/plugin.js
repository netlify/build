const { writeFile, readFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    await cache.save(id)

    const newId = String(Math.random()).replace('.', '')
    await pWriteFile(id, newId)

    await cache.restore(id)
    const contents = await pReadFile(id, 'utf8')
    console.log(contents === newId)
    await del(id)
  },
}
