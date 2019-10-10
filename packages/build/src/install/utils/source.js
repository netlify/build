const source = require('shell-source')

module.exports = function sourceIt(srcPath) {
  console.log('Source', srcPath)
  return new Promise((resolve, reject) => {
    source(srcPath, function(err) {
      if (err) {
        console.error(err)
        return reject(err)
      }

      console.log(process.env.SERVER_HOST)
      console.log(process.env.SERVER_PORT)
      console.log(process.env.PATH)
      return resolve(process.env)
    })
  })
}
