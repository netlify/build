const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { cache } }) {
    const idOne = String(Math.random()).replace('.', '')
    const idTwo = String(Math.random()).replace('.', '')
    const digest = String(Math.random()).replace('.', '')

    const path = String(Math.random()).replace('.', '')
    const digestPath = `${path}.digest`
    const digestPathTwo = `${path}.digestTwo`

    await pWriteFile(path, idOne)
    await pWriteFile(digestPath, digest)
    console.log(await cache.save(path, { digests: [digestPathTwo, digestPath] }))
    await pWriteFile(path, idTwo)
    console.log(await cache.save(path, { digests: [digestPathTwo, digestPath] }))
    await del(path)
    await del(digestPath)
  },
}
