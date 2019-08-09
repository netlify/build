#!/usr/bin/env node

const build = require('./build')

build().catch((e) => {
  console.log(e)
})
