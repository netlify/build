import { mkdir } from 'fs/promises'
import { platform } from 'process'

import { execa } from 'execa'

export const unzipFile = async function (path: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true })

  if (platform === 'win32') {
    await execa('tar', ['-xf', path, '-C', dest]), { verbose: 'full' }
  } else {
    await execa('unzip', ['-o', path, '-d', dest], { verbose: 'full' })
  }
}
