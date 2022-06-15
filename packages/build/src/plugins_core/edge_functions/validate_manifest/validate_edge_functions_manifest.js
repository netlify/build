import { promises as fs } from 'fs'
import { createRequire } from 'module'
import { join, resolve } from 'path'

import Ajv from 'ajv'

import { addErrorInfo } from '../../../error/info.js'
import { log } from '../../../log/logger.js'
import { hasEdgeFunctionsDirectories } from '../utils.js'

const require = createRequire(import.meta.url)
const ajv = new Ajv({ allErrors: true })
require('ajv-errors')(ajv)

// regex pattern for manifest route pattern
// checks if the pattern string starts with ^ and ends with $
// we define this format in edge-bundler:
// https://github.com/netlify/edge-bundler/blob/main/src/manifest.ts#L66
const normalizedPatternRegex = /^\^.*\$$/
ajv.addFormat('regexPattern', {
  async: true,
  validate: (data) => normalizedPatternRegex.test(data),
})

const bundlesSchema = {
  $async: true,
  type: 'object',
  required: ['asset', 'format'],
  properties: {
    asset: { type: 'string' },
    format: { type: 'string' },
  },
  additionalProperties: false,
}

const routesSchema = {
  $async: true,
  type: 'object',
  required: ['function', 'pattern'],
  properties: {
    function: { type: 'string' },
    pattern: { type: 'string', format: 'regexPattern' },
  },
  additionalProperties: false,
}

const edgeManifestSchema = {
  $async: true,
  type: 'object',
  required: ['bundles', 'routes', 'bundler_version'],
  properties: {
    bundles: {
      type: 'array',
      items: bundlesSchema,
    },
    routes: {
      type: 'array',
      items: routesSchema,
    },
    bundler_version: { type: 'string' },
  },
  additionalProperties: false,
  errorMessage: "Couldn't validate Edge Functions manifest.json",
}

const validateManifest = async (manifestData) => {
  const validate = ajv.compile(edgeManifestSchema)

  await validate(manifestData)
}

const coreStep = async function ({ buildDir, constants: { EDGE_FUNCTIONS_DIST: distDirectory }, logs }) {
  try {
    const edgeFunctionsDistPath = resolve(buildDir, distDirectory)
    const manifestPath = join(edgeFunctionsDistPath, 'manifest.json')
    const data = await fs.readFile(manifestPath)
    const manifestData = JSON.parse(data)

    await validateManifest(manifestData)

    log(logs, JSON.stringify(manifestData, null, 2))
  } catch (error) {
    const isValidationErr = error instanceof Ajv.ValidationError
    const parsedErr = isValidationErr ? error.errors : error

    // console.dir for pretty printing and syntax highlighting
    console.dir(parsedErr, { depth: null, colors: true })
    addErrorInfo(parsedErr, { type: 'coreStep' })
    throw new Error(isValidationErr ? JSON.stringify(parsedErr) : parsedErr)
  }

  return {}
}

export const validateEdgeFunctionsManifest = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'edge_functions_manifest_validation',
  coreStepName: 'Edge Functions manifest validation',
  coreStepDescription: () => 'Edge Functions manifest validation',
  condition: hasEdgeFunctionsDirectories,
}
