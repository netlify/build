const { exec } = require('child_process')

// execa doesnt handle pipe commands (as far as I can tell)
module.exports = function execAsync(cmd, opts) {
  return new Promise((resolve, reject) => {
    const process = exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        /* catch know errorss
        if (stdout.match(/does not exist/)) {
          return resolve({ stdout, stderr })
        }
        */

        return reject(err)
      }

      return resolve({ stdout, stderr })
    })
    process.stdout.on('data', data => {
      // console.log(`${data}`)
    })
    process.stderr.on('data', data => {
      // console.log(`${data.toString()}`)
    })
    process.on('exit', code => {
      // console.log('child process exited with code ' + code.toString())
    })
  })
}
