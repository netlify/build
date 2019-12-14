const { spawn } = require('child_process')

const { debug } = require('../debug')

const d = debug('localGetDiff')

const localGetDiff = (base, head) => {
  return new Promise(done => {
    const args = ['diff', `${base}...${head}`]
    let stdout = ''
    let stdErr = ''
    const child = spawn('git', args, { env: process.env })
    d('> git', args.join(' '))
    child.stdout.on('data', chunk => {
      stdout += chunk
    })
    child.stderr.on('data', data => {
      console.error(`Could not get diff from git between ${base} and ${head}`)
      stdErr += data.toString()
      throw new Error(data.toString())
    })
    child.on('close', function(code) {
      if (code === 0) {
        done(stdout)
      }
    })
    child.on('error', error => {
      stdErr += error.toString()
      if (stdErr) {
        console.log('git diff error', stdErr)
      }
    })
  })
}

module.exports.localGetDiff = localGetDiff
