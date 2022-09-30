import { resolve } from 'path'
import { fileURLToPath } from 'url'

import { getLogger } from '../node/logger.js'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const testLogger = getLogger(() => {})

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

export { fixturesDir, testLogger }
