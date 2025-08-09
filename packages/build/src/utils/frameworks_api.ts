import { basename, dirname, resolve, sep } from 'node:path'

import { fdir } from 'fdir'

export const FRAMEWORKS_API_ENDPOINT = '.netlify/v1'
export const FRAMEWORKS_API_BLOBS_ENDPOINT = `${FRAMEWORKS_API_ENDPOINT}/blobs`
export const FRAMEWORKS_API_CONFIG_ENDPOINT = `${FRAMEWORKS_API_ENDPOINT}/config.json`
export const FRAMEWORKS_API_EDGE_FUNCTIONS_ENDPOINT = `${FRAMEWORKS_API_ENDPOINT}/edge-functions`
export const FRAMEWORKS_API_EDGE_FUNCTIONS_IMPORT_MAP = 'import_map.json'
export const FRAMEWORKS_API_FUNCTIONS_ENDPOINT = `${FRAMEWORKS_API_ENDPOINT}/functions`
export const FRAMEWORKS_API_SKEW_PROTECTION_ENDPOINT = `${FRAMEWORKS_API_ENDPOINT}/skew-protection.json`

export const EDGE_REDIRECTS_DIST_PATH = '.netlify/deploy-config/edge-redirects.json'

type DirectoryTreeFiles = Map<string, string[]>

/**
 * Traverses a directory tree in search of leaf files. The key of each leaf
 * file is determined by its path relative to the base directory.
 *
 * For example, given the following directory tree:
 *
 * .netlify/
 * └── v1/
 *     └── blobs/
 *         └── deploy/
 *             ├── example.com/
 *             │   └── blob
 *             └── netlify.com/
 *                 ├── blob
 *                 └── blob.meta.json
 *
 * If this method is called on `.netlify/v1/blobs/deploy` with `blob` and
 * `blob.meta.json` as leaf names, it will return the following Map:
 *
 * {
 *   "example.com" => [
 *      "/full/path/to/.netlify/v1/blobs/deploy/example.com/blob"
 *   ],
 *   "netlify.com" => [
 *      "/full/path/to/.netlify/v1/blobs/deploy/netlify.com/blob",
 *      "/full/path/to/.netlify/v1/blobs/deploy/netlify.com/blob.meta.json"
 *   ]
 * }
 */
export const findFiles = async (directory: string, leafNames: Set<string>) => {
  const results: DirectoryTreeFiles = new Map()
  const groups = await new fdir()
    .withRelativePaths()
    .filter((path) => leafNames.has(basename(path)))
    .group()
    .crawl(directory)
    .withPromise()

  groups.forEach(({ files }) => {
    if (files.length === 0) {
      return
    }

    const key = dirname(files[0]).split(sep).join('/')

    results.set(
      key,
      files.map((relativePath) => resolve(directory, relativePath)),
    )
  })

  return results
}

const BLOBS_CONTENT_FILE = 'blob'
const BLOBS_META_FILE = 'blob.meta.json'

/**
 * Finds blobs and their corresponding metadata files in a given directory.
 */
export const getBlobs = async (blobsDirectory: string) => {
  const files = await findFiles(blobsDirectory, new Set([BLOBS_CONTENT_FILE, BLOBS_META_FILE]))
  const blobs: { key: string; contentPath: string; metadataPath?: string }[] = []

  files.forEach((filePaths, key) => {
    const contentPath = filePaths.find((path) => basename(path) === 'blob')

    if (!contentPath) {
      return
    }

    const metadataPath = filePaths.find((path) => basename(path) === BLOBS_META_FILE)

    blobs.push({
      key,
      contentPath,
      metadataPath,
    })
  })

  return blobs
}
