import assert from 'assert'
import childProcess from 'child_process'
import { rm } from 'fs/promises'
import { createRequire } from 'module'
import { join, resolve } from 'path'
import process from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { promisify } from 'util'

import cpy from 'cpy'
import { x as tarExtract } from 'tar'
import tmp from 'tmp-promise'

const exec = promisify(childProcess.exec)
const require = createRequire(import.meta.url)
const functionsDir = resolve(fileURLToPath(import.meta.url), '..', 'functions')
const internalFunctionsDir = resolve(fileURLToPath(import.meta.url), '..', 'internal-functions')

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

  await tarExtract({ C: path, file: filename, strip: 1 })

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
  const { path: basePath } = await tmp.dir()

  console.log(`Copying test fixture to '${basePath}'...`)

  await cpy(`${functionsDir}/**`, join(basePath, 'functions'))
  await cpy(`${internalFunctionsDir}/**`, join(basePath, 'internal-functions'))

  pathsToCleanup.add(basePath)

  const destPath = join(basePath, '.netlify', 'edge-functions-dist')

  console.log(`Bundling functions at '${basePath}'...`)

  const bundleOutput = await bundle(
    [join(basePath, 'functions'), join(basePath, 'internal-functions')],
    destPath,
    [{ function: 'func1', path: '/func1' }],
    {
      basePath,
      internalSrcFolder: join(basePath, 'internal-functions'),
    },
  )

  return {
    basePath,
    bundleOutput,
  }
}

const runAssertions = ({ basePath, bundleOutput }) => {
  console.log('Running assertions on bundle output:')
  console.log(JSON.stringify(bundleOutput, null, 2))

  const { functions } = bundleOutput

  assert.strictEqual(functions.length, 2)
  assert.strictEqual(functions[0].name, 'func2')
  assert.strictEqual(functions[0].path, join(basePath, 'internal-functions', 'func2.ts'))
  assert.strictEqual(functions[1].name, 'func1')
  assert.strictEqual(functions[1].path, join(basePath, 'functions', 'func1.ts'))
}

const cleanup = async () => {
  if (process.env.CI) {
    return
  }

  console.log(`Cleaning up temporary files...`)

  for (const folder of pathsToCleanup) {
    await rm(folder, { force: true, recursive: true, maxRetries: 10 })
  }
}

installPackage()
  .then(bundleFunction)
  .then(runAssertions)
  .then(cleanup)
  .catch((error) => {
    console.error(error)

    throw error
  })
