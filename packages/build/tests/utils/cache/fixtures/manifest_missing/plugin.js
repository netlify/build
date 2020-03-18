const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)
const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    console.log(await cache.save(id, { ttl: 5 }))
    console.log(await cache.has(id))
    await pSetTimeout(10e3)

    await del(`.netlify/cache/cwd/${id}.netlify.cache.json`)

    console.log(await cache.has(id))
    await del(id)
  },
}
