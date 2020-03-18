const { writeFile } = require('fs')
const { promisify } = require('util')
const { homedir } = require('os')
const { resolve } = require('path')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')
// eslint-disable-next-line node/no-extraneous-require
const pathExists = require('path-exists')
// eslint-disable-next-line node/no-extraneous-require
const makeDir = require('make-dir')

const pWriteFile = promisify(writeFile)

module.exports = {
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')
    const path = resolve(homedir(), id)
    await makeDir(homedir())

    await pWriteFile(path, id)
    console.log(await cache.save(path))
    await del(path, { force: true })

    console.log(await cache.restore(path))
    console.log(await pathExists(path))
    await del(path, { force: true })
  },
}
