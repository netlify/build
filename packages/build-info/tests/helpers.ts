import { tmpdir } from 'os'
import { join } from 'path'
import { fileURLToPath } from 'url'

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
    await fs.cp(fileURLToPath(new URL(`fixtures/${fixture}`, import.meta.url)), cwd, {
      recursive: true,
    })
  } catch (error) {
    console.log(error?.message)
  }

  return {
    cwd,
    cwdSpy,
    cleanup: async () => {
      await fs.rm(cwd, { recursive: true })
    },
  }
}
