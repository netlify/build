import { type TestContext } from 'vitest'

import type { FileSystem } from './src/file-system.js'

export interface ExtendedTestContext extends TestContext {
  fs: FileSystem
  cwd: string
  cleanup?: () => Promise<void>
}

declare module 'vitest' {
  export interface TestContext {
    fs: FileSystem
    cwd: string
    cleanup?: () => Promise<void>
  }
}
