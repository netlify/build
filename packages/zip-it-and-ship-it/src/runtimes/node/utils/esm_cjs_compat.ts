/**
 * This shim makes calls to `require`, `__filename` and `__dirname` work when
 * bundling to ESM with esbuild. esbuild does not parse a banner, so the paths
 * live under private names and `CJS_SHIM_DEFINE` maps the globals onto them
 * only where the user's code has not declared them itself.
 *
 * https://github.com/evanw/esbuild/pull/2067
 */
export const CJS_SHIM = `
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let ___nfyFilename=___nfyFileURLToPath(import.meta.url);
let ___nfyDirname=___nfyPathDirname(___nfyFilename);
let require=___nfyCreateRequire(import.meta.url);
`

export const CJS_SHIM_DEFINE = {
  __dirname: '___nfyDirname',
  __filename: '___nfyFilename',
}
