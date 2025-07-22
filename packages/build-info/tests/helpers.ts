import { readFile, readdir, stat } from 'node:fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { type TestContext, vi } from 'vitest'

/**
 * Copies a fixture to a temp folder on the system and runs the tests inside.
 * This prevents side effects of having a package json below the fixture inside the file tree
 * @param fixture name of the folder inside the fixtures folder
 */
export const createFixture = async (fixture: string, ctx: TestContext) => {
  // we mocked the fs with unionfs but in this case we want the actual fs
  const { promises: fs } = (await vi.importActual('fs')) as typeof import('fs')
  const cwd = await fs.mkdtemp(join(tmpdir(), 'build-info-'))
  const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
  ctx.cwd = cwd
  // set the cwd on the fs as well
  if (ctx.fs) {
    ctx.fs.cwd = cwd
  }

  try {
    const src = fileURLToPath(new URL(`fixtures/${fixture}`, import.meta.url))
    await fs.cp(src, cwd, { recursive: true })
  } catch {
    // noop
  }

  const cleanup = async () => {
    try {
      await fs.rm(cwd, { recursive: true })
    } catch {
      // noop
    }
  }
  // set the cleanup on the context as well
  ctx.cleanup = cleanup

  return {
    cwd,
    cwdSpy,
    cleanup,
  }
}

export const createWebFixture = async (fixture: string) => {
  // This is a mock for the github api functionality to have consistent tests and no rate limiting
  global.fetch = vi.fn(async (url): Promise<any> => {
    const { pathname } = new URL(url as string)
    const fileOrPath = pathname.replace(/(^.+\/contents)/, '')
    const src = fileURLToPath(new URL(`fixtures/${fixture}${fileOrPath}`, import.meta.url))

    try {
      const info = await stat(src)
      if (info.isDirectory()) {
        const entries = await readdir(src, { withFileTypes: true })
        return Response.json(
          entries.map((entry) => ({
            path: entry.name,
            type: entry.isDirectory() ? 'dir' : 'file',
          })),
        )
      } else {
        const file = await readFile(src, 'utf-8')
        return new Response(file)
      }
    } catch {
      // noop
    }

    return Response.json({ error: 'not found' }, { status: 404 })
  })

  return { cwd: '/' }
}
