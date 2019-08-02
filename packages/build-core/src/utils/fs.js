const fs = require('fs')
const path = require('path')
const makeDir = require('make-dir')
const copy = require('cpy') /* @TODO `cpy` doesnt recursively move files */
const del = require('del')
const isInvalidFilePath = require('is-invalid-path')
const execAsync = require('./execAsync')
// var isWindows = require('is-windows');

function writeFile(filePath, contents) {
  return new Promise(async (resolve, reject) => {
    const dir = path.dirname(filePath)
    const dirExists = await fileExists(dir)
    if (!dirExists) {
      await makeDir(dir)
    }
    fs.writeFile(filePath, contents, (error) => {
      if (error) return reject(error)
      return resolve(filePath)
    })
  })
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) return reject(error)
      return resolve(data)
    })
  })
}

function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.F_OK, (err) => {
      if (err) return resolve(false)
      return resolve(true)
    })
  })
}

//
async function copyFiles(files, destination, opts = {}) {
  const options = Object.assign({}, {
    cwd: 'set cwd',
    parents: true,
    overwrite: true
  }, opts)
  const filesToCopy = (typeof files === 'string') ? [files] : files
  console.log('filesToCopy', filesToCopy)
  console.log('destination', destination)
  const copiedPaths = await copy(filesToCopy, destination, options)
  // .on('progress', (progress) => {
  //   console.log('copy progress', progress)
  // })
  console.log(`Copy files ${destination}`, copiedPaths)
  return copiedPaths
}

async function removeFiles(filePaths, opts = {}) {
  const removeFiles = (typeof filePaths === 'string') ? [filePaths] : filePaths
  const deletedPaths = await del(removeFiles, opts)
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'))
  return deletedPaths
}

async function copyDirectory(src, dist) {
  console.log(`Copying ${src} into ${dist}...`)
  const finalSrc = src.replace(/\/$/, '')
  // Valid path is a path
  if (isInvalidFilePath(src) || isInvalidFilePath(dist)) {
    throw new Error('Not a valid file path')
  }

  if (!await fileExists(src)) {
    console.log(`Skipping cache copy for ${src}. It doesnt exist`)
    return false
  }

  const dir = path.dirname(dist)
  const dirExists = await fileExists(dist)
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
  fileExists,
  copyFiles: copyDirectory,
  // copyDirectory,
  removeFiles
}
