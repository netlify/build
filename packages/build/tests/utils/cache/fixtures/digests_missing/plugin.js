const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)

module.exports = {
  async onInit({ utils: { cache } }) {
    const idOne = String(Math.random()).replace('.', '')
    const idTwo = String(Math.random()).replace('.', '')

    const path = String(Math.random()).replace('.', '')
    const digestPath = `${path}.digest`

    await pWriteFile(path, idOne)
    console.log(await cache.save(path, { digests: [digestPath] }))
    await pWriteFile(path, idTwo)
    console.log(await cache.save(path, { digests: [digestPath] }))
    await del(path)
  },
}
