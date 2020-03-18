const { writeFile } = require('fs')
const { promisify } = require('util')

// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const pWriteFile = promisify(writeFile)

module.exports = {
  async onInit({ utils: { cache } }) {
    const id = String(Math.random()).replace('.', '')

    await pWriteFile(id, id)
    console.log(await cache.save([id, `${id}_`]))
    await del(id)

    console.log(await cache.has([id, `${id}_`]))
    console.log(await cache.has([`${id}__`, `${id}_`]))
    console.log(await cache.remove([id, `${id}_`]))
    console.log(await cache.has([id, `${id}_`]))
    console.log(await cache.remove([id, `${id}_`]))
  },
}
