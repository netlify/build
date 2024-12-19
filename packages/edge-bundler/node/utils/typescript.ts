import { build } from 'esbuild'

export const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.cts', '.ctsx', '.mts', '.mtsx'])

export const transpile = async (filePath: string) => {
  const result = await build({
    bundle: false,
    entryPoints: [filePath],
    loader: {
      // esbuild uses the extension of each entrypoint to determine the
      // right loader to use. This doesn't work with the internal files
      // from the Deno cache, so we must tell it to use the TypeScript
      // loader for any files without an extension.
      '': 'ts',
    },
    logLevel: 'silent',
    platform: 'node',
    write: false,
  })

  return result.outputFiles[0].text
}
