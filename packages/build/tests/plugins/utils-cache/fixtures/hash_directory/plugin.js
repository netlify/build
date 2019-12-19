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
  name: 'netlify-plugin-test',
  async onInit({ utils: { cache } }) {
    const dir = 'src'
    await makeDir(dir)

    const paths = await makeFiles(dir)

    await cache.save(dir)
    await cache.save(dir, { move: true })
    console.log((await Promise.all(paths.map(path => pathExists(path)))).every(Boolean))
    await del(dir)
  },
}

const makeFiles = function(dir) {
  return Promise.all(Array.from({ length: 100 }, () => makeFile(dir)))
}

const makeFile = async function(dir) {
  const id = String(Math.random()).replace('.', '')
  const path = `${dir}/${id}`
  await pWriteFile(path, id)
  return path
}
