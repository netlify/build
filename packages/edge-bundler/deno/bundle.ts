import { load } from 'https://deno.land/x/eszip@v0.16.0/loader.ts'
import { build, LoadResponse } from 'https://deno.land/x/eszip@v0.16.0/mod.ts'

const IDENTIFIER_BUNDLE_COMBINED = 'netlify:bundle-combined'

const createLoader = (srcPath: string): ((specifier: string) => Promise<LoadResponse | undefined>) => {
  return async (specifier: string): Promise<LoadResponse | undefined> => {
    // If we're loading the combined bundle identifier, we override the loading
    // to read the file from disk and return the contents.
    if (specifier === IDENTIFIER_BUNDLE_COMBINED) {
      const content = await Deno.readTextFile(new URL(srcPath))

      return {
        content,
        headers: {
          'content-type': 'application/typescript',
        },
        kind: 'module',
        specifier,
      }
    }

    // Falling back to the default loading logic.
    return load(specifier)
  }
}

const [srcPath, destPath] = Deno.args
const bytes = await build([IDENTIFIER_BUNDLE_COMBINED], createLoader(srcPath))

await Deno.writeFile(destPath, bytes)
