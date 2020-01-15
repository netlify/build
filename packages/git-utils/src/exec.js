const execa = require('execa')
const moize = require('moize').default

// Fires the `git` binary. Memoized.
const mGit = async function(args, cwd) {
  const { stdout } = await execa('git', args, { cwd })
  return stdout
}

const git = moize(mGit, { isDeepEqual: true })

module.exports = { git }
