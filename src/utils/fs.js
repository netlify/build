const fs = require('fs')
const path = require('path')
const makeDir = require('make-dir')
const copy = require('cpy')
const del = require('del')

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

async function copyFiles(files, destination, opts = {}) {
  const filesToCopy = (typeof files === 'string') ? [files] : files
  const x = await copy(filesToCopy, destination, opts)
  console.log('Copy files', x)
  return x
}

async function removeFiles(filePaths, opts = {}) {
  const removeFiles = (typeof filePaths === 'string') ? [filePaths] : filePaths
  const deletedPaths = await del(removeFiles, opts)
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'))
  return deletedPaths
}

module.exports = {
  writeFile,
  readFile,
  fileExists,
  copyFiles,
  removeFiles
}
