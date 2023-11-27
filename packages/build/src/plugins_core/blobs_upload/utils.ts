import fsPromises from 'node:fs/promises'
import path from 'node:path'

import { fdir } from 'fdir'

import { getBlobsDir } from '../../utils/blobs.js'

const METADATA_PREFIX = '$'
const METADATA_SUFFIX = '.json'

export const anyBlobsToUpload = async function ({ buildDir, publishDir }) {
  const blobsDir = getBlobsDir({ buildDir, publishDir })
  const { files } = await new fdir().onlyCounts().crawl(blobsDir).withPromise()
  return files > 0
}

/** Given output directory, find all file paths to upload excluding metadata files */
export async function getKeysToUpload(blobsDir: string): Promise<string[]> {
  const files = await new fdir()
    .withRelativePaths() // we want the relative path from the blobsDir
    .filter((fpath) => !path.basename(fpath).startsWith(METADATA_PREFIX))
    .crawl(blobsDir)
    .withPromise()

  // normalize the path separators to all use the forward slash
  return files.map((f) => f.split(path.sep).join('/'))
}

/** Read a file and its metadata file from the blobs directory */
export async function getFileWithMetadata(
  blobsDir: string,
  key: string,
): Promise<{ data: Buffer; metadata: Record<string, string> }> {
  const contentPath = path.join(blobsDir, key)
  const dirname = path.dirname(key)
  const basename = path.basename(key)
  const metadataPath = path.join(blobsDir, dirname, `${METADATA_PREFIX}${basename}${METADATA_SUFFIX}`)

  const [data, metadata] = await Promise.all([fsPromises.readFile(contentPath), readMetadata(metadataPath)]).catch(
    (err) => {
      throw new Error(`Failed while reading '${key}' and its metadata: ${err.message}`)
    },
  )

  return { data, metadata }
}

async function readMetadata(metadataPath: string): Promise<Record<string, string>> {
  let metadataFile
  try {
    metadataFile = await fsPromises.readFile(metadataPath, { encoding: 'utf8' })
  } catch (err) {
    if (err.code === 'ENOENT') {
      // no metadata file found, that's ok
      return {}
    }
    throw err
  }

  try {
    return JSON.parse(metadataFile)
  } catch  {
    // Normalize the error message
    throw new Error(`Error parsing metadata file '${metadataPath}'`)
  }
}
