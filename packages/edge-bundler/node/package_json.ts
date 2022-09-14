import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkgJson = require('../package.json')

const getPackageVersion = (): string => pkgJson.version

export { getPackageVersion }
