import { randomUUID } from 'crypto'
import { mkdtemp } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const PREFIX = 'test-functions-utils-'

// Retrieve name of a temporary directory
export const getDist = async function () {
  return join(tmpdir(), `${PREFIX}${randomUUID()}`)
}

// Create temporary directory
export const createDist = async function () {
  return await mkdtemp(join(tmpdir(), PREFIX))
}
