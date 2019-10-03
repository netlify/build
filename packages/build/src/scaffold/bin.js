const runBuild = require('./main')

runBuild({
  buildDir: '',
  buildCmd: 'echo "hi"',
  functionsDir: '',
  zisiTempDir: '',
  nodeVersion: '10.16.0',
  rubyVersion: '2.6.2',
  yarnVersion: ''
}).catch(err => {
  console.log('err', err)
})
