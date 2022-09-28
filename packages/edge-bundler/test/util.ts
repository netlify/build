import { resolve } from 'path'
import { fileURLToPath } from 'url'

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

export { fixturesDir }
