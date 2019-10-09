#!/usr/bin/env node
const { argv } = require('process')

const minimist = require('minimist')
const omit = require('omit.js')

require('../utils/polyfills')

const build = require('./main')

async function runCli() {
  const options = minimist(argv.slice(2))
  const optionsA = omit(options, ['_'])
  await build(optionsA)
}

runCli()
