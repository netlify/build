const path = require('path')
const fs = require('fs')
const util = require('util')

const readDirAsync = util.promisify(fs.readdir)

module.exports = async function detectFunctionsBuilder() {
  const detectors = (await readDirAsync(path.join(__dirname, 'function-builder-detectors')))
    .filter(x => x.endsWith('.js')) // only accept .js detector files
    .map(det => require(path.join(__dirname, `function-builder-detectors/${det}`)))

  for (const i in detectors) {
    const settings = detectors[i]()
    if (settings) {
      return settings
    }
  }
}
