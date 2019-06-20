const minimist = require('minimist')
const runBuild = require('./index')

const argv = minimist(process.argv.slice(2))

console.log('argv', argv)

// runBuild({
//   buildDir: ,
//   buildCmd,
//   functionsDir,
//   zisiTempDir,
//   nodeVersion,
//   rubyVersion,
//   yarnVersion
// })
