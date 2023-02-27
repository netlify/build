import { execSync } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { version } from 'process'
import { fileURLToPath } from 'url'

import { compare } from 'semver'
import { vi } from 'vitest'

/**
 * Copies a fixture to a temp folder on the system and runs the tests inside.
 * This prevents side effects of having a package json below the fixture inside the file tree
 * @param fixture name of the folder inside the fixtures folder
 */
export const createFixture = async (fixture: string) => {
  // we mocked the fs with unionfs but in this case we want the actual fs
  const { promises: fs } = (await vi.importActual('fs')) as typeof import('fs')
  const cwd = await fs.mkdtemp(join(tmpdir(), 'build-info-'))
  const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)

  try {
    const src = fileURLToPath(new URL(`fixtures/${fixture}`, import.meta.url))
    // fs.cp is only supported in node 16.7+ as long as we have to maintain support for node 14
    // we need a workaround for the tests (remove once support is dropped)
    if (compare(version, '16.7.0') < 0) {
      execSync(`cp -r ${src}/* ${cwd}`)
    } else {
      await fs.cp(src, cwd, {
        recursive: true,
      })
    }
  } catch {
    // noop
  }

  return {
    cwd,
    cwdSpy,
    cleanup: async () => {
      await fs.rm(cwd, { recursive: true })
    },
  }
}
