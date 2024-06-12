import { basename, dirname, resolve, sep } from 'node:path'

import { fdir } from 'fdir'

export const FRAMEWORKS_API_BLOBS_ENDPOINT = '.netlify/v1/blobs'
export const FRAMEWORKS_API_CONFIG_ENDPOINT = '.netlify/v1/config.json'
export const FRAMEWORKS_API_EDGE_FUNCTIONS_ENDPOINT = '.netlify/v1/edge-functions'
export const FRAMEWORKS_API_EDGE_FUNCTIONS_IMPORT_MAP = 'import_map.json'
export const FRAMEWORKS_API_FUNCTIONS_ENDPOINT = '.netlify/v1/functions'

type DirectoryTreeFiles = Map<string, string[]>

export const findFiles = async (directory: string, filenames: Set<string>) => {
  const results: DirectoryTreeFiles = new Map()
  const groups = await new fdir()
    .withRelativePaths()
    .filter((path) => filenames.has(basename(path)))
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

export const getBlobs = async (blobsDirectory: string) => {
  const files = await findFiles(blobsDirectory, new Set(['blob', 'blob.meta.json']))
  const blobs: { key: string; contentPath: string; metadataPath?: string }[] = []

  files.forEach((filePaths, key) => {
    const contentPath = filePaths.find((path) => basename(path) === 'blob')

    if (!contentPath) {
      return
    }

    const metadataPath = filePaths.find((path) => basename(path) === 'blob.meta.json')

    blobs.push({
      key,
      contentPath,
      metadataPath,
    })
  })

  return blobs
}
