import type { Declaration } from './declaration.js';
import { Handler } from './handler.js';
declare const generateManifest: (bundlePath: string, handlers: Handler[], declarations?: Declaration[]) => {
    bundle: string;
    handlers: {
        handler: string;
        pattern: string;
    }[];
};
export { generateManifest };
