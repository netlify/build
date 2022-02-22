import { resolve } from 'path'

const getESZIPBundler = () => {
  const { pathname } = new URL(import.meta.url)
  const bundlerPath = resolve(pathname, '../../deno/bundle.ts')

  return bundlerPath
}

export { getESZIPBundler }
