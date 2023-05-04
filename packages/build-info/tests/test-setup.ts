import fs from 'fs'

import { afterEach, vi } from 'vitest'

vi.mock('fs', async () => {
  const unionFs: any = (await import('unionfs')).default
  const fs = await vi.importActual('fs')
  unionFs.reset = () => {
    unionFs.fss = [fs]
  }

  const united = unionFs.use(fs)
  return { default: united, ...united }
})

// cleanup after each test as a fallback if someone forgot to call it
afterEach(async ({ cleanup }) => {
  if (typeof cleanup === 'function') {
    await cleanup()
  }

  if ('reset' in fs) {
    ;(fs as any).reset()
  }
})
