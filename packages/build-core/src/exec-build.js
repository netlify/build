const build = require('./build')

build().catch((e) => {
  console.log(e)
})
