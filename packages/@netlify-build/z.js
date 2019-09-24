const minimist = require('minimist')

console.log('before process.argv', process.argv)
process.argv = process.argv.slice(2)

const args = minimist(process.argv)

console.log('args', args)
