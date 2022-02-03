import { tmpName } from 'tmp-promise';
import { DenoBridge } from './bridge.js';
import { preBundle } from './bundler.js';
import { generateManifest } from './manifest.js';
const serve = async (port, sourceDirectories, declarations) => {
    const deno = new DenoBridge();
    const distDirectory = await tmpName();
    const { handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory);
    const manifest = generateManifest(preBundlePath, handlers, declarations);
    // TODO: Add `--no-clear-screen` when https://github.com/denoland/deno/pull/13454 is released.
    deno.run(['run', '-A', '--unstable', '--watch', preBundlePath, port.toString()], { wait: false });
    return {
        manifest,
    };
};
export { serve };
