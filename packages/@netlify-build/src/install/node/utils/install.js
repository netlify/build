const path = require('path')

const execa = require('execa')

const { fileExists } = require('../../../utils/fs')

/* Install a dep with yarn or npm */
module.exports = async function installWithYarnOrNpm(name, cwd) {
  const yarnLock = path.join(cwd, 'yarn.lock')
  const hasYarnLock = await fileExists(yarnLock)

  const [use, cmd] = hasYarnLock ? ['yarn', 'add'] : ['npm', 'install']

  // TODO check for package-lock. for `npm ci`
  // https://hackernoon.com/how-to-speed-up-continuous-integration-build-with-new-npm-ci-and-package-lock-json-7647f91751a

  try {
    await execa(use, [cmd, name])
  } catch (err) {
    console.log('Install Error', err)
  }
}
