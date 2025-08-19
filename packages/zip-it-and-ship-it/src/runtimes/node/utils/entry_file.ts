import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { basename, extname, resolve } from 'path'

import type { FeatureFlags } from '../../../feature_flags.js'
import { FunctionBundlingUserError } from '../../../utils/error.js'
import { RUNTIME } from '../../runtime.js'

import {
  getFileExtensionForFormat,
  ModuleFileExtension,
  ModuleFormat,
  MODULE_FILE_EXTENSION,
  MODULE_FORMAT,
} from './module_format.js'
import { normalizeFilePath } from './normalize_path.js'

export const ENTRY_FILE_NAME = '___netlify-entry-point'
export const BOOTSTRAP_FILE_NAME = '___netlify-bootstrap.mjs'
export const BOOTSTRAP_VERSION_FILE_NAME = '___netlify-bootstrap-version'
export const METADATA_FILE_NAME = '___netlify-metadata.json'
export const TELEMETRY_FILE_NAME = '___netlify-telemetry.mjs'

const require = createRequire(import.meta.url)

export interface EntryFile {
  contents: string
  filename: string
}

/**
 * A minimal implementation of kebab-case.
 * It is used to transform the generator name into a service name for the telemetry file.
 * As DataDog has a special handling for the service name, we need to make sure it is kebab-case.
 */
export const kebabCase = (input: string): string =>
  input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[@#//$\s_\\.-]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .join('-')

const getEntryFileContents = (
  mainPath: string,
  moduleFormat: string,
  _featureFlags: FeatureFlags,
  runtimeAPIVersion: number,
) => {
  const importPath = `.${mainPath.startsWith('/') ? mainPath : `/${mainPath}`}`

  if (runtimeAPIVersion === 2) {
    return [
      `import * as bootstrap from './${BOOTSTRAP_FILE_NAME}'`,
      `export const handler = bootstrap.getLambdaHandler('${importPath}')`,
    ].join(';')
  }

  if (moduleFormat === MODULE_FORMAT.COMMONJS) {
    return `module.exports = require('${importPath}')`
  }

  return `export { handler } from '${importPath}'`
}

// They are in the order that AWS Lambda will try to find the entry point
const POSSIBLE_LAMBDA_ENTRY_EXTENSIONS = [
  MODULE_FILE_EXTENSION.JS,
  MODULE_FILE_EXTENSION.MJS,
  MODULE_FILE_EXTENSION.CJS,
]

// checks if the file is considered a entry-file in AWS Lambda
export const isNamedLikeEntryFile = (
  file: string,
  {
    basePath,
    filename,
    runtimeAPIVersion,
  }: {
    basePath: string
    filename: string
    runtimeAPIVersion: number
  },
) =>
  POSSIBLE_LAMBDA_ENTRY_EXTENSIONS.some((extension) => {
    const entryFilename = getEntryFileName({ extension, filename, runtimeAPIVersion })
    const entryFilePath = resolve(basePath, entryFilename)

    return entryFilePath === file
  })

// Check if any src file (except the mainFile) is considered an entry file for AWS Lambda
export const conflictsWithEntryFile = (
  srcFiles: string[],
  {
    basePath,
    extension,
    filename,
    mainFile,
    runtimeAPIVersion,
  }: {
    basePath: string
    extension: string
    filename: string
    mainFile: string
    runtimeAPIVersion: number
  },
) => {
  let hasConflict = false

  srcFiles.forEach((srcFile) => {
    if (srcFile.includes(ENTRY_FILE_NAME)) {
      throw new FunctionBundlingUserError(
        `'${ENTRY_FILE_NAME}' is a reserved word and cannot be used as a file or directory name.`,
        {
          functionName: basename(filename, extension),
          runtime: RUNTIME.JAVASCRIPT,
        },
      )
    }

    // If we're generating a unique entry file, we know we don't have a conflict
    // at this point.
    if (runtimeAPIVersion === 2) {
      return
    }

    if (
      !hasConflict &&
      isNamedLikeEntryFile(srcFile, { basePath, filename, runtimeAPIVersion }) &&
      srcFile !== mainFile
    ) {
      hasConflict = true
    }
  })

  return hasConflict
}

// Returns the name for the AWS Lambda entry file
// We do set the handler in AWS Lambda to `<func-name>.handler` and because of
// this it considers `<func-name>.(c|m)?js` as possible entry-points
const getEntryFileName = ({
  extension,
  filename,
  runtimeAPIVersion,
}: {
  extension: ModuleFileExtension
  filename: string
  runtimeAPIVersion: number
}) => {
  if (runtimeAPIVersion === 2) {
    return `${ENTRY_FILE_NAME}.mjs`
  }

  return `${basename(filename, extname(filename))}${extension}`
}

export const getTelemetryFile = (generator?: string): EntryFile => {
  // TODO: switch with import.meta.resolve once we drop support for Node 16.x
  const filePath = require.resolve('@netlify/serverless-functions-api/instrumentation.js')
  let serviceName: string | undefined
  let serviceVersion: string | undefined

  if (generator) {
    // the generator can be something like: `@netlify/plugin-nextjs@14.13.2`
    // following the convention of name@version but it must not have a version.
    // split the generator by the @ sign to separate name and version.
    // pop the last part (the version) and join the rest with a @ again.
    const versionSepPos = generator.lastIndexOf('@')
    if (versionSepPos > 1) {
      const name = generator.substring(0, versionSepPos)
      const version = generator.substring(versionSepPos + 1)
      serviceVersion = version
      serviceName = kebabCase(name)
    } else {
      serviceName = kebabCase(generator)
    }
  }

  const contents = `
var SERVICE_NAME = ${JSON.stringify(serviceName)};
var SERVICE_VERSION = ${JSON.stringify(serviceVersion)};
${readFileSync(filePath, 'utf8')}
`

  return {
    contents,
    filename: TELEMETRY_FILE_NAME,
  }
}

export const getEntryFile = ({
  commonPrefix,
  featureFlags,
  filename,
  mainFile,
  moduleFormat,
  userNamespace,
  runtimeAPIVersion,
}: {
  commonPrefix: string
  featureFlags: FeatureFlags
  filename: string
  mainFile: string
  moduleFormat: ModuleFormat
  userNamespace: string
  runtimeAPIVersion: number
}): EntryFile => {
  const mainPath = normalizeFilePath({ commonPrefix, path: mainFile, userNamespace })
  const extension = getFileExtensionForFormat(moduleFormat, featureFlags, runtimeAPIVersion)
  const entryFilename = getEntryFileName({ extension, filename, runtimeAPIVersion })
  const contents = getEntryFileContents(mainPath, moduleFormat, featureFlags, runtimeAPIVersion)

  return {
    contents,
    filename: entryFilename,
  }
}
