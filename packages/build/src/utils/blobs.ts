import path from 'node:path'

const BLOBS_PATH = '.netlify/blobs/deploy'

export const getBlobsDir = function ({ buildDir, publishDir }) {
  return path.resolve(buildDir, publishDir, BLOBS_PATH)
}
