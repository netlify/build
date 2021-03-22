#!/usr/bin/env node
'use strict'

const process = require('process')

const execa = require('execa')

const [, , command] = process.argv

const runLocal = async function () {
  if (process.env.CI !== 'true') {
    await execa.command(command, { stdio: 'inherit' })
  }
}

runLocal()
