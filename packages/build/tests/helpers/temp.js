import { realpath } from 'fs'
import { tmpdir } from 'os'
import { normalize } from 'path'
import { promisify } from 'util'

import makeDir from 'make-dir'

const pRealpath = promisify(realpath)

// Create and retrieve a new temporary sub-directory
export const getTempDir = async function () {
  const tempDir = await getTempName()
  await makeDir(tempDir)
  return tempDir
}

export const getTempName = async function () {
  const tempDir = tmpdir()
  const tempDirA = await pRealpath(tempDir)
  const id = String(Math.random()).replace('.', '')
  const tempName = normalize(`${tempDirA}/netlify-build-tmp-dir${id}`)
  return tempName
}
