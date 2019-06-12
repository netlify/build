const path = require('path')
const execa = require('execa')
const { fileExists } = require('../../../utils/fs')

/* Install a dep with yarn or npm */
module.exports = async function installWithYarnOrNpm(name, cwd) {
  const yarnLock = path.join(cwd, 'yarn.lock')
  const hasYarnLock = await fileExists(yarnLock)

  const [use, cmd] = (hasYarnLock) ? ['yarn', 'add'] : ['npm', 'install']

  try {
    await execa(use, [cmd, name])
  } catch (err) {
    console.log('Install Error', err)
  }
}
