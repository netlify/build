const path = require('path')
const util = require('util')

// eslint-disable-next-line node/no-unpublished-require
const getHeuristics = require('../index')

getHeuristics({
  pkgPath: path.join(__dirname, 'package.json'),
  configPath: path.join(__dirname, 'netlify.toml'),
}).then(info => {
  console.log(
    util.inspect(info, {
      showHidden: false,
      depth: null,
      colors: true,
    }),
  )
})
