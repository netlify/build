import assert from 'assert'
import childProcess from 'child_process'
import { createRequire } from 'module'
import { join, resolve } from 'path'
import process from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { promisify } from 'util'

import { deleteAsync } from 'del'
import tar from 'tar'
import tmp from 'tmp-promise'

const exec = promisify(childProcess.exec)
const require = createRequire(import.meta.url)
const functionsDir = resolve(fileURLToPath(import.meta.url), '..', 'functions')

const pathsToCleanup = new Set()

const installPackage = async () => {
  console.log(`Getting package version...`)

  const { name, version } = require('../../package.json')

  console.log(`Running integration tests for ${name} v${version}...`)

  const { path } = await tmp.dir()

  console.log(`Creating tarball with 'npm pack'...`)

  await exec('npm pack --json')

  const normalizedName = name.replace(/@/, '').replace(/\W/g, '-')
  const filename = join(process.cwd(), `${normalizedName}-${version}.tgz`)

  console.log(`Uncompressing the tarball at '${filename}'...`)

  // eslint-disable-next-line id-length
  await tar.x({ C: path, file: filename, strip: 1 })

  pathsToCleanup.add(path)
  pathsToCleanup.add(filename)

  return path
}

const bundleFunction = async (bundlerDir) => {
  console.log(`Installing dependencies at '${bundlerDir}'...`)

  await exec(`npm --prefix ${bundlerDir} install`)

  const bundlerPath = require.resolve(bundlerDir)
  const bundlerURL = pathToFileURL(bundlerPath)
  const { bundle } = await import(bundlerURL)
  const { path: destPath } = await tmp.dir()

  pathsToCleanup.add(destPath)

  console.log(`Bundling functions at '${functionsDir}'...`)

  return await bundle([functionsDir], destPath, [{ function: 'func1', path: '/func1' }])
}

const runAssertions = (bundleOutput) => {
  console.log('Running assertions on bundle output:')
  console.log(JSON.stringify(bundleOutput, null, 2))

  const { functions } = bundleOutput

  assert.equal(functions.length, 1)
  assert.equal(functions[0].name, 'func1')
  assert.equal(functions[0].path, join(functionsDir, 'func1.ts'))
}

const cleanup = async () => {
  const directories = [...pathsToCleanup]

  console.log(`Cleaning up temporary files...`)

  await deleteAsync(directories, { force: true })
}

installPackage()
  .then(bundleFunction)
  .then(runAssertions)
  .then(cleanup)
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  .catch((error) => {
    console.error(error)

    throw error
  })
