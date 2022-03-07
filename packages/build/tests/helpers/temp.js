import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { normalize } from 'path'

// Create and retrieve a new temporary sub-directory
export const getTempDir = async function () {
  const tempDir = await getTempName()
  await fs.mkdir(tempDir, { recursive: true })
  return tempDir
}

export const getTempName = async function () {
  const tempDir = tmpdir()
  const tempDirA = await fs.realpath(tempDir)
  const id = String(Math.random()).replace('.', '')
  const tempName = normalize(`${tempDirA}/netlify-build-tmp-dir${id}`)
  return tempName
}
