import { LifecycleHook } from './bridge.js';
import type { Declaration } from './declaration.js';
interface ServeOptions {
    onAfterDownload?: LifecycleHook;
    onBeforeDownload?: LifecycleHook;
}
declare const serve: (port: number, sourceDirectories: string[], { onAfterDownload, onBeforeDownload }?: ServeOptions) => Promise<{
    getManifest: (declarations: Declaration[]) => {
        bundle: string;
        handlers: {
            handler: string;
            pattern: string;
        }[];
    };
}>;
export { serve };
