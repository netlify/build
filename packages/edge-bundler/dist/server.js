import { tmpName } from 'tmp-promise';
import { DenoBridge } from './bridge.js';
import { preBundle } from './bundler.js';
import { generateManifest } from './manifest.js';
const serve = async (port, sourceDirectories, { onAfterDownload, onBeforeDownload } = {}) => {
    const deno = new DenoBridge({
        onAfterDownload,
        onBeforeDownload,
    });
    const distDirectory = await tmpName();
    const { handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory);
    const getManifest = (declarations) => generateManifest(preBundlePath, handlers, declarations);
    // Wait for the binary to be downloaded if needed.
    await deno.getBinaryPath();
    // TODO: Add `--no-clear-screen` when https://github.com/denoland/deno/pull/13454 is released.
    const flags = ['-A', '--unstable', '--watch'];
    deno.run(['run', ...flags, preBundlePath, port.toString()], { wait: false });
    return {
        getManifest,
    };
};
export { serve };
