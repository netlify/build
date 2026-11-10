import { createRequire } from 'module'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

export default async () =>
  Response.json({ filename: __filename, dirname: __dirname, requiredJoin: typeof require('path').join })
