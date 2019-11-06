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

runNvm('nvm install 7').then(d => {
  console.log('d', d)
})
