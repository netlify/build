const { spawn } = require('child_process')

const JSON5 = require('json5')

const { debug } = require('../debug')

const d = debug('localGetDiff')
const sha = '%H'
const parents = '%p'
const authorName = '%an'
const authorEmail = '%ae'
const authorDate = '%ai'
const committerName = '%cn'
const committerEmail = '%ce'
const committerDate = '%ci'
const message = '%f' // this is subject, not message, so it'll only be one line
const author = `"author": {"name": "${authorName}", "email": "${authorEmail}", "date": "${authorDate}" }`
const committer = `"committer": {"name": "${committerName}", "email": "${committerEmail}", "date": "${committerDate}" }`

const formatJSON = `{ "sha": "${sha}", "parents": "${parents}", ${author}, ${committer}, "message": "${message}"},`

const localGetCommits = (base, head) => {
  return new Promise(done => {
    const args = ['log', `${base}...${head}`, `--pretty=format:${formatJSON}`]
    const child = spawn('git', args, { env: process.env })
    let stdOut = ''
    let stdErr = ''
    let realCommits = []
    d('> git', args.join(' '))
    child.stdout.on('data', async data => {
      data = data.toString()
      stdOut += data.toString()
      // remove trailing comma, and wrap into an array
      const asJSONString = `[${data.substring(0, data.length - 1)}]`
      const commits = JSON5.parse(asJSONString)
      realCommits = realCommits.concat(commits.map(c =>
        Object.assign(Object.assign({}, c), { parents: c.parents.split(' ') })
      ))
    })
    child.stderr.on('data', data => {
      stdErr += data.toString()
      console.error(`Could not get commits from git between ${base} and ${head}`)
      throw new Error(cleanStack(data.toString()))
    })
    child.on('close', (code) => {
      if (code === 0) {
        // console.log(`exit_code = ${code}`);
        // console.log('no commits found')
        return done(realCommits)
      }
      // console.log(`exit_code = ${code}`);
      return done(stdErr);
    });
    child.on('error', (error) => {
      stdErr += error.toString();
      if (stream_output) {
        console.log(error.toString());
      }
    })
  })
}

module.exports.formatJSON = formatJSON
module.exports.localGetCommits = localGetCommits
