#!/usr/bin/env node
const path = require('path')

const minimist = require('minimist')

const args = minimist(process.argv.slice(2))
const netlifyConfig = require('./index')
const { getConfigFile } = require('./index')

async function execConfig() {
  let config
  try {
    let configPath
    // No path supplied
    if (!args._ || !args._.length) {
      configPath = await getConfigFile(process.cwd())
    } else if (args._[0]) {
      // No path arg supplied
      configPath = path.resolve(process.cwd(), args._[0])
    }
    config = await netlifyConfig(configPath, args)
  } catch (err) {
    console.log(err.message)
  }

  return config
}

execConfig(args)
  .then(config => {
    if (config) console.log(config)
  })
  .catch(e => {
    console.log('error', e)
  })
