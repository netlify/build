import path from 'node:path'

import { fdir } from 'fdir'

const BLOBS_PATH = '.netlify/blobs/deploy'

export const getBlobsDir = function ({ buildDir, publishDir }) {
  return path.resolve(buildDir, publishDir, BLOBS_PATH)
}

export const anyBlobsToUpload = async function ({ buildDir, publishDir }) {
  const blobsDir = getBlobsDir({ buildDir, publishDir })
  const { files } = await new fdir().onlyCounts().crawl(blobsDir).withPromise()
  return files > 0
}
