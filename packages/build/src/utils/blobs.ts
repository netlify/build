import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { fdir } from 'fdir'

import { DEFAULT_API_HOST } from '../core/normalize_flags.js'

import { FRAMEWORKS_API_BLOBS_PATH } from './frameworks_api.js'

const LEGACY_BLOBS_PATH = '.netlify/blobs/deploy'
const DEPLOY_CONFIG_BLOBS_PATH = '.netlify/deploy/v1/blobs/deploy'

/** Retrieve the absolute path of the deploy scoped internal blob directories */
export const getBlobsDirs = (buildDir: string, packagePath?: string) => [
  path.resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH),
  path.resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH),
]

interface EnvironmentContext {
  api?: {
    host: string
    scheme: string
  }
  deployId?: string
  siteId?: string
  token?: string
}

// TODO: Move this work to a method exported by `@netlify/blobs`.
export const getBlobsEnvironmentContext = ({
  api = { host: DEFAULT_API_HOST, scheme: 'https' },
  deployId,
  siteId,
  token,
}: EnvironmentContext) => {
  if (!deployId || !siteId || !token) {
    return {}
  }

  const payload = {
    apiURL: `${api.scheme}://${api.host}`,
    deployID: deployId,
    siteID: siteId,
    token,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')

  return {
    NETLIFY_BLOBS_CONTEXT: encodedPayload,
  }
}

/**
 * Detect if there are any blobs to upload, and if so, what directory they're
 * in and what version of the file-based API is being used.
 *
 * @param buildDir The build directory. (current working directory where the build is executed)
 * @param packagePath An optional package path for monorepos
 * @returns
 */
export const scanForBlobs = async function (buildDir: string, packagePath?: string) {
  // We start by looking for files using the Frameworks API.
  const frameworkBlobsDir = path.resolve(buildDir, packagePath || '', FRAMEWORKS_API_BLOBS_PATH, 'deploy')
  const frameworkBlobsDirScan = await new fdir().onlyCounts().crawl(frameworkBlobsDir).withPromise()

  if (frameworkBlobsDirScan.files > 0) {
    return {
      apiVersion: 3,
      directory: frameworkBlobsDir,
    }
  }

  // Next, we look for files using the legacy Deploy Configuration API. It was
  // short-lived and not really documented, but we do have sites relying on
  // it, so we must support it for backwards-compatibility.
  const deployConfigBlobsDir = path.resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH)
  const deployConfigBlobsDirScan = await new fdir().onlyCounts().crawl(deployConfigBlobsDir).withPromise()

  if (deployConfigBlobsDirScan.files > 0) {
    return {
      apiVersion: 2,
      directory: deployConfigBlobsDir,
    }
  }

  // Finally, we look for files using the initial spec for file-based Blobs
  // uploads.
  const legacyBlobsDir = path.resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH)
  const legacyBlobsDirScan = await new fdir().onlyCounts().crawl(legacyBlobsDir).withPromise()

  if (legacyBlobsDirScan.files > 0) {
    return {
      apiVersion: 1,
      directory: legacyBlobsDir,
    }
  }

  return null
}

const METADATA_PREFIX = '$'
const METADATA_SUFFIX = '.json'

/**
 * Returns the blobs that should be uploaded for a given directory tree. The
 * result is an array with the blob key, the path to its data file, and the
 * path to its metadata file.
 */
export const getKeysToUpload = async (blobsDir: string) => {
  const files = await new fdir()
    .withRelativePaths() // we want the relative path from the blobsDir
    .filter((fpath) => !path.basename(fpath).startsWith(METADATA_PREFIX))
    .crawl(blobsDir)
    .withPromise()

  return files.map((filePath) => {
    const key = filePath.split(path.sep).join('/')
    const contentPath = path.resolve(blobsDir, filePath)
    const basename = path.basename(filePath)
    const metadataPath = path.resolve(
      blobsDir,
      path.dirname(filePath),
      `${METADATA_PREFIX}${basename}${METADATA_SUFFIX}`,
    )

    return {
      key,
      contentPath,
      metadataPath,
    }
  })
}

/** Read a file and its metadata file from the blobs directory */
export const getFileWithMetadata = async (
  key: string,
  contentPath: string,
  metadataPath?: string,
): Promise<{ data: Buffer; metadata: Record<string, string> }> => {
  const [data, metadata] = await Promise.all([
    readFile(contentPath),
    metadataPath ? readMetadata(metadataPath) : {},
  ]).catch((err) => {
    throw new Error(`Failed while reading '${key}' and its metadata: ${err.message}`)
  })

  return { data, metadata }
}

const readMetadata = async (metadataPath: string): Promise<Record<string, string>> => {
  let metadataFile: string
  try {
    metadataFile = await readFile(metadataPath, { encoding: 'utf8' })
  } catch (err) {
    if (err.code === 'ENOENT') {
      // no metadata file found, that's ok
      return {}
    }
    throw err
  }

  try {
    return JSON.parse(metadataFile)
  } catch {
    // Normalize the error message
    throw new Error(`Error parsing metadata file '${metadataPath}'`)
  }
}
