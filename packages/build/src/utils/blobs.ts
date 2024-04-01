import { resolve } from 'node:path'

import { fdir } from 'fdir'

const LEGACY_BLOBS_PATH = '.netlify/blobs/deploy'
const DEPLOY_CONFIG_BLOBS_PATH = '.netlify/deploy/v1/blobs/deploy'

/** Retrieve the absolute path of the deploy scoped internal blob directories */
export const getBlobsDirs = (buildDir: string, packagePath?: string) => [
  resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH),
  resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH),
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
  const blobsDir = resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH)
  const blobsDirScan = await new fdir().onlyCounts().crawl(blobsDir).withPromise()

  if (blobsDirScan.files > 0) {
    return {
      directory: blobsDir,
      isLegacyDirectory: false,
    }
  }

  const legacyBlobsDir = resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH)
  const legacyBlobsDirScan = await new fdir().onlyCounts().crawl(legacyBlobsDir).withPromise()

  if (legacyBlobsDirScan.files > 0) {
    return {
      directory: legacyBlobsDir,
      isLegacyDirectory: true,
    }
  }

  return null
}
