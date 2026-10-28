// `glob` is marked experimental in 20.12.0 (our node). Fine for a script, though.
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { copyFile, glob, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = join(root, 'src')
const lib = join(root, 'lib')

for await (const file of glob('**/*.yml', { cwd: src })) {
  const dest = join(lib, file)
  await mkdir(dirname(dest), { recursive: true })
  await copyFile(join(src, file), dest)
}
