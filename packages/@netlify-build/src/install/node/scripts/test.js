const path = require('path')
const execa = require('execa')
const installScript = path.join(__dirname, 'install-node.sh')
const versionScript = path.join(__dirname, 'get-node-version.sh')
const runNvmCommand = path.join(__dirname, 'run-nvm.sh')
const runNvm = require('./runNvm')
/*
execa(`sh ${versionScript}`, { shell: true }).then((e) => {
  console.log(e)
}).catch((err) => {
  console.log('err', err)
})
 */

 // execa(`sh ${runNvmCommand} current`, { shell: true }).then((e) => {
 //   console.log(e)
 // }).catch((err) => {
 //   console.log('err', err)
 // })

runNvm('nvm install 7').then((d) => {
  console.log('d', d)
})
