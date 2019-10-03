const path = require('path')

const execa = require('execa')
const makeDir = require('make-dir')

module.exports = async function setTempDir() {
  const tmpPath = path.join(process.env.HOME, 'tmp')
  await makeDir(tmpPath)
  try {
    await execa('npm', ['set', 'tmp', tmpPath])
  } catch (err) {
    console.log('Error setting npm tmp path')
    console.log('err', err)
  }
}
