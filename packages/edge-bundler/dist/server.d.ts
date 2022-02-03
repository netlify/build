import type { Declaration } from './declaration.js';
declare const serve: (port: number, sourceDirectories: string[], declarations: Declaration[]) => Promise<{
    manifest: {
        bundle: string;
        handlers: {
            handler: string;
            pattern: string;
        }[];
    };
}>;
export { serve };
