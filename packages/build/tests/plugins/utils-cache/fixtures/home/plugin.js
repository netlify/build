const { writeFile } = require('fs')
const { promisify } = require('util')
const { homedir } = require('os')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')
// eslint-disable-next-line node/no-extraneous-require
const pathExists = require('path-exists')

const pWriteFile = promisify(writeFile)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')
    const path = `${homedir()}/id`

    await pWriteFile(path, id)
    await cache.save(path)
    await del(path, { force: true })

    await cache.restore(path)
    console.log(await pathExists(path))
    await del(path, { force: true })
  },
}
