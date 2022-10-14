import { git } from './exec.js'

// Return information on each commit since the `base` commit, such as SHA,
// parent commits, author, committer and commit message
export const getCommits = function (base, head, cwd) {
  const stdout = git(['log', `--pretty=${GIT_PRETTY_FORMAT}`, `${base}...${head}`], cwd)
  const commits = stdout.split('\n').map(getCommit)
  return commits
}

// Parse the commit output from a string to a JavaScript object
const getCommit = function (line) {
  const [sha, parents, authorName, authorEmail, authorDate, committerName, committerEmail, committerDate, message] =
    line.split(GIT_PRETTY_SEPARATOR)
  return {
    sha,
    parents,
    author: { name: authorName, email: authorEmail, date: authorDate },
    committer: { name: committerName, email: committerEmail, date: committerDate },
    message,
  }
}

// `git log --pretty` does not have any way of separating tokens, except for
// commits being separated by newlines. Since some tokens (like the commit
// message or the committer name) might contain a wide range of characters, we
// need a specific separator.
// We choose RS (Record separator) which is a rarely used control character
// intended for this very purpose: separating records. It is used by some
// formats such as JSON text sequences (RFC 7464).
const GIT_PRETTY_SEPARATOR = '\u001E'
// List of commit fields we want to retrieve
const GIT_PRETTY_FORMAT = ['%H', '%p', '%an', '%ae', '%ai', '%cn', '%ce', '%ci', '%f'].join(GIT_PRETTY_SEPARATOR)
