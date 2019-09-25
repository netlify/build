const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const makeDir = require('make-dir')
const del = require('del')
const isInvalidFilePath = require('is-invalid-path')

const execAsync = require('./execAsync')

const pWriteFile = promisify(fs.writeFile)
const pReadFile = promisify(fs.readFile)
const pReaddir = promisify(fs.readdir)
const pStat = promisify(fs.stat)

async function writeFile(filePath, contents) {
  const dir = path.dirname(filePath)
  const dirExists = await fileExists(dir)
  if (!dirExists) {
    await makeDir(dir)
  }
  await pWriteFile(filePath, contents)
}

async function readFile(filePath) {
  const content = await pReadFile(filePath, 'utf8')
  return content
}

function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.F_OK, err => {
      if (err) return resolve(false)
      return resolve(true)
    })
  })
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

  if (!(await fileExists(src))) {
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

async function readDir(dir, allFiles = []) {
  const files = (await pReaddir(dir)).map(f => path.join(dir, f))
  allFiles.push(...files)
  await Promise.all(files.map(async f => (await pStat(f)).isDirectory() && readDir(f, allFiles)))
  return allFiles
}

module.exports = {
  writeFile,
  readFile,
  fileExists,
  copyFiles,
  removeFiles,
  readDir
}
