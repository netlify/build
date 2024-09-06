import type { Framework } from './frameworks/framework.js'

export const listFrameworks = async ({ projectDir }: { projectDir: string }): Promise<Framework[]> => {
  // FIXME(serhalp) implement
  console.log({ projectDir })
  throw new Error('Not implemented')
}
