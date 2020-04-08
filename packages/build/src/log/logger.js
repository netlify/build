// This should be used instead of `console.log()`
const log = function(...args) {
  const string = args.join('\n')
  console.log(string)
}

module.exports = { log }
