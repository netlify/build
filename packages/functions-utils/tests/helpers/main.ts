import { tmpName, dir as tmpDir } from 'tmp-promise'
const PREFIX = 'test-functions-utils-'

// Retrieve name of a temporary directory
export const getDist = function () {
  return tmpName({ prefix: PREFIX })
}

// Create temporary directory
export const createDist = async function () {
  const { path } = await tmpDir({ prefix: PREFIX })
  return path
}
