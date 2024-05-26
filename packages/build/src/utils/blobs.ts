import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { fdir } from 'fdir'

import { FRAMEWORKS_API_BLOBS_ENDPOINT } from './frameworks_api.js'

const LEGACY_BLOBS_PATH = '.netlify/blobs/deploy'
const DEPLOY_CONFIG_BLOBS_PATH = '.netlify/deploy/v1/blobs/deploy'

/** Retrieve the absolute path of the deploy scoped internal blob directories */
export const getBlobsDirs = (buildDir: string, packagePath?: string) => [
  path.resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH),
  path.resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH),
]

/**
 * Detect if there are any blobs to upload, and if so, what directory they're
 * in and whether that directory is the legacy `.netlify/blobs` path or the
 * newer deploy config API endpoint.
 *
 * @param buildDir The build directory. (current working directory where the build is executed)
 * @param packagePath An optional package path for mono repositories
 * @returns
 */
export const scanForBlobs = async function (buildDir: string, packagePath?: string) {
  const frameworkBlobsDir = path.resolve(buildDir, packagePath || '', FRAMEWORKS_API_BLOBS_ENDPOINT, 'deploy')
  const frameworkBlobsDirScan = await new fdir().onlyCounts().crawl(frameworkBlobsDir).withPromise()

  if (frameworkBlobsDirScan.files > 0) {
    return {
      directory: frameworkBlobsDir,
      isLegacyDirectory: false,
    }
  }

  const deployConfigBlobsDir = path.resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH)
  const deployConfigBlobsDirScan = await new fdir().onlyCounts().crawl(deployConfigBlobsDir).withPromise()

  if (deployConfigBlobsDirScan.files > 0) {
    return {
      directory: deployConfigBlobsDir,
      isLegacyDirectory: false,
    }
  }

  const legacyBlobsDir = path.resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH)
  const legacyBlobsDirScan = await new fdir().onlyCounts().crawl(legacyBlobsDir).withPromise()

  if (legacyBlobsDirScan.files > 0) {
    return {
      directory: legacyBlobsDir,
      isLegacyDirectory: true,
    }
  }

  return null
}

const METADATA_PREFIX = '$'
const METADATA_SUFFIX = '.json'

/** Given output directory, find all file paths to upload excluding metadata files */
export const getKeysToUpload = async (blobsDir: string): Promise<string[]> => {
  const files = await new fdir()
    .withRelativePaths() // we want the relative path from the blobsDir
    .filter((fpath) => !path.basename(fpath).startsWith(METADATA_PREFIX))
    .crawl(blobsDir)
    .withPromise()

  // normalize the path separators to all use the forward slash
  return files.map((f) => f.split(path.sep).join('/'))
}

/** Read a file and its metadata file from the blobs directory */
export const getFileWithMetadata = async (
  blobsDir: string,
  key: string,
): Promise<{ data: Buffer; metadata: Record<string, string> }> => {
  const contentPath = path.join(blobsDir, key)
  const dirname = path.dirname(key)
  const basename = path.basename(key)
  const metadataPath = path.join(blobsDir, dirname, `${METADATA_PREFIX}${basename}${METADATA_SUFFIX}`)

  const [data, metadata] = await Promise.all([readFile(contentPath), readMetadata(metadataPath)]).catch((err) => {
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
