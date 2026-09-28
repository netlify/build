import { join } from 'node:path'
import { env } from 'node:process'
import os from 'node:os'

let configPath: string
const homedir = os.homedir()

switch (process.platform) {
  case 'darwin':
    configPath = join(homedir, 'Library/Preferences/netlify')
    break
  case 'win32':
    configPath = join(env.APPDATA ?? join(homedir, 'AppData/Roaming'), 'netlify/Config')
    break
  default:
    configPath = join(env.XDG_CONFIG_HOME ?? join(homedir, '.config'), 'netlify')
    break
}

const getPathInHome = (path: string) => join(configPath, path)

export { getPathInHome }
