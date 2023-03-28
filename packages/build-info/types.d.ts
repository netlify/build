import type { FileSystem } from './src/file-system.js'

declare module 'vitest' {
  export interface TestContext {
    fs: FileSystem
    cwd: string
    cleanup?: () => Promise<void>
  }
}
