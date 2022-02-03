import { LifecycleHook } from './bridge.js';
import type { Declaration } from './declaration.js';
import { Handler } from './handler.js';
interface BundleOptions {
    onAfterDownload?: LifecycleHook;
    onBeforeDownload?: LifecycleHook;
}
declare const bundle: (sourceDirectories: string[], distDirectory: string, declarations?: Declaration[], { onAfterDownload, onBeforeDownload }?: BundleOptions) => Promise<{
    bundlePath: string;
    handlers: Handler[];
    manifest: void;
    preBundlePath: string;
}>;
declare const preBundle: (sourceDirectories: string[], distDirectory: string) => Promise<{
    entrypointHash: string;
    handlers: Handler[];
    preBundlePath: string;
}>;
export { bundle, preBundle };
