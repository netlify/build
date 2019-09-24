const path = require('path')

const execa = require('execa')
const runNvmCommand = path.join(__dirname, 'run-nvm.sh')

module.exports = async function runNvm(cmd) {
  if (!cmd || !cmd.match(/^nvm/) || cmd.match(/"/)) {
    throw new Error('NVM cmd malformed')
  }
  const command = cmd.replace(/^nvm/, '')
  const subprocess = execa(`sh ${runNvmCommand} "${command}"`, { shell: true })
  subprocess.stdout.pipe(process.stdout)
  const { stdout } = await subprocess
  return stdout
}
