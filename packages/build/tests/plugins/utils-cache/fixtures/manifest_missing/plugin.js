const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)
const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    await cache.save(id, { ttl: 1 })
    console.log(await cache.has(id))
    await pSetTimeout(2e3)

    await del(`.netlify/cache/cwd/${id}.cache.json`)

    console.log(await cache.has(id))
    await del(id)
  },
}
