const execAsync = require('../../utils/execAsync')

async function findRunningProcs() {
  let stdout
  try {
    const proc = await execAsync(
      'ps aux | grep -v [p]s | grep -v [g]rep | grep -v [b]ash | grep -v "/usr/local/bin/buildbot" | grep -v [d]efunct | grep -v "[build]"'
    )
    /* didnt work with execa
    const proc = await execa('ps', [
      'aux', '|',
      'grep', '-v', '[p]s', '|',
      'grep', '-v', '[g]rep', '|',
      'grep', '-v', '[b]ash', '|',
      'grep', '-v', '"/usr/local/bin/buildbot"', '|',
      'grep', '-v', '[d]efunct', '|',
      'grep', '-v', '"[build]"'
    ])
    */
    if (proc.stderr) {
      throw new Error(proc.stderr)
    }
    stdout = proc.stdout
  } catch (e) {
    console.log('Find running processes error', e)
  }
  // remove trailing whitespace line
  return stdout.replace(/\n$/, '')
}

function getProcessCount(processes) {
  if (!processes) {
    return 0
  }
  // Split processes at new line
  return (processes.split(/\r\n|\r|\n/) || []).length
}

module.exports = {
  findRunningProcs,
  getProcessCount
}
