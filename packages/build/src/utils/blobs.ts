import { resolve } from 'node:path'

import { fdir } from 'fdir'

const BLOBS_PATH = '.netlify/blobs/deploy'

/** Retrieve the absolute path of the deploy scoped internal blob directory */
export const getBlobsDir = (buildDir: string, packagePath?: string) => resolve(buildDir, packagePath || '', BLOBS_PATH)

/**
 * Detect if there are any blobs to upload
 * @param buildDir The build directory. (current working directory where the build is executed)
 * @param packagePath An optional package path for mono repositories
 * @returns
 */
export const anyBlobsToUpload = async function (buildDir: string, packagePath?: string) {
  const blobsDir = getBlobsDir(buildDir, packagePath)
  const { files } = await new fdir().onlyCounts().crawl(blobsDir).withPromise()
  return files > 0
}
