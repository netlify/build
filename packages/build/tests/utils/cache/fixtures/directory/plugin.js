const { writeFile } = require('fs')
const { promisify } = require('util')

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
    const dir = 'src'
    const path = `${dir}/${id}`

    await makeDir(dir)
    await pWriteFile(path, id)
    console.log(await cache.save(dir))
    await del(dir)

    console.log(await cache.restore(dir))
    console.log(await pathExists(path))
    await del(dir)
  },
}
