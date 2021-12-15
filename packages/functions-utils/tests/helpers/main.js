import del from 'del'
import { tmpName, dir as tmpDir } from 'tmp-promise'

// Retrieve name of a temporary directory
export const getDist = function () {
  return tmpName({ prefix: PREFIX })
}

// Create temporary directory
export const createDist = async function () {
  const { path } = await tmpDir({ prefix: PREFIX })
  return path
}

const PREFIX = 'test-functions-utils-'

// Remove temporary directory
export const removeDist = async function (dir) {
  await del(dir, { force: true })
}
