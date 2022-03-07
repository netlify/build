import { resolve } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

const CURRENT_DIR = fileURLToPath(new URL('.', import.meta.url))

console.log(cwd() === resolve(CURRENT_DIR))
