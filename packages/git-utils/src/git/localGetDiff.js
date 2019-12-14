const { spawn } = require('child_process')

const { debug } = require('../debug')

const d = debug('localGetDiff')

const localGetDiff = (base, head) => {
  return new Promise((done, reject) => {
    const args = ['diff', `${base}...${head}`]
    let stdout = ''
    let stdErr = ''
    const child = spawn('git', args, { env: process.env })
    d('> git', args.join(' '))
    child.stdout.on('data', chunk => {
      stdout += chunk
    })
    child.stderr.on('data', data => {
      console.log(`Could not get diff from git between ${base} and ${head}`)
      stdErr += data.toString()
      reject(stdErr)
    })
    child.on('close', function(code) {
      if (code === 0) {
        done(stdout)
      }
      // no diffs found. Return empty state
      done('')
    })
    child.on('error', error => {
      stdErr += error.toString()
      if (stdErr) {
        console.log('git diff error', stdErr)
        reject(stdErr)
      }
    })
  })
}

module.exports.localGetDiff = localGetDiff
