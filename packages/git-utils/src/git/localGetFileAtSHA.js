const { exec } = require('child_process')

const { debug } = require('../debug')

const d = debug('localGetFileAtSHA')

const localGetFileAtSHA = (path, _repo, sha) => {
  return new Promise(done => {
    const call = `git show ${sha}:'${path}'`
    d(call)
    exec(call, (err, stdout) => {
      if (err) {
        console.error(`Could not get the file ${path} from git at ${sha}`)
        console.error(err)
        return
      }
      done(stdout)
    })
  })
}

module.exports.localGetFileAtSHA = localGetFileAtSHA
