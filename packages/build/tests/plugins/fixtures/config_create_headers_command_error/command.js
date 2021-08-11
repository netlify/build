'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const pWriteFile = promisify(writeFile)

const buildCommand = async function () {
  await pWriteFile(`${__dirname}/_headers`, 'test: one')
}

buildCommand()
