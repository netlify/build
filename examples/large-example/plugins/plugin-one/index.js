
module.exports = function exampleOne(conf) {
  const hook = conf.hook || 'preBuild'
  return {
    [`${hook}`]: () => {
      console.log('do the stuff')
    }
  }
}
