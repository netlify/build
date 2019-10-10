const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const makeDir = require('make-dir')
const del = require('del')
const isInvalidFilePath = require('is-invalid-path')
const pathExists = require('path-exists')

const execAsync = require('./execAsync')

const pWriteFile = promisify(fs.writeFile)
const pReadFile = promisify(fs.readFile)

async function writeFile(filePath, contents) {
  const dir = path.dirname(filePath)
  if (!(await pathExists(dir))) {
    await makeDir(dir)
  }
  await pWriteFile(filePath, contents)
}

async function readFile(filePath) {
  const content = await pReadFile(filePath, 'utf8')
  return content
}

async function removeFiles(filePaths, opts = {}) {
  const removeFiles = typeof filePaths === 'string' ? [filePaths] : filePaths
  const deletedPaths = await del(removeFiles, opts)
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'))
  return deletedPaths
}

async function copyFiles(src, dist) {
  console.log(`Copying ${src} into ${dist}...`)
  const finalSrc = src.replace(/\/$/, '')
  // Valid path is a path
  if (isInvalidFilePath(src) || isInvalidFilePath(dist)) {
    throw new Error('Not a valid file path')
  }

  if (!(await pathExists(src))) {
    console.log(`Skipping cache copy for ${src}. It doesnt exist`)
    return false
  }

  const dir = path.dirname(dist)
  const dirExists = await pathExists(dist)
  if (!dirExists) {
    await makeDir(dir)
  }

  // TODO verify this is cross platform
  const copyCommand = `rsync -ahr ${finalSrc}/ ${dist} --recursive`
  // const copyCommand = `cp -r ${src}/* ${dist}`
  return execAsync(copyCommand)
}

module.exports = {
  writeFile,
  readFile,
  copyFiles,
  removeFiles
}
