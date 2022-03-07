import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const FOREVER_SCRIPT = fileURLToPath(new URL('forever.js', import.meta.url))

export const onPreBuild = function () {
  const { pid } = spawn('node', [FOREVER_SCRIPT], { detached: true, stdio: 'ignore' })
  console.log(`PID: ${pid}`)
}
