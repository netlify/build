import { mkdirSync, realpathSync } from 'fs'
import { tmpdir } from 'os'
import { normalize } from 'path'

/** Create and retrieve a new temporary sub-directory */
export const getTempDir = (): string => {
  const tempDir = getTempName()
  mkdirSync(tempDir, { recursive: true })
  return tempDir
}

export const getTempName = (): string => {
  const tempDir = realpathSync(tmpdir())
  const id = String(Math.random()).replace('.', '')
  return normalize(`${tempDir}/netlify-build-tmp-dir${id}`)
}
