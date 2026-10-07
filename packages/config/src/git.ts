import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const runGit = async function (args: string[], cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd })
    return stdout.replace(/\r?\n$/, '')
  } catch {
    return undefined
  }
}
