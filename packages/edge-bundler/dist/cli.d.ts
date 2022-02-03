import type { Declaration } from './declaration.js';
declare type LifecycleHook = () => void | Promise<void>;
interface DenoOptions {
    cacheDirectory?: string;
    onAfterDownload?: LifecycleHook;
    onBeforeDownload?: LifecycleHook;
    useGlobal?: boolean;
    versionRange?: string;
}
declare class DenoCLI {
    cacheDirectory: string;
    onAfterDownload?: LifecycleHook;
    onBeforeDownload?: LifecycleHook;
    useGlobal: boolean;
    versionRange: string;
    constructor(options?: DenoOptions);
    static getBinaryVersion(binaryPath: string): Promise<string | undefined>;
    private getCachedBinary;
    private getGlobalBinary;
    private getRemoteBinary;
    private writeVersionFile;
    bundle(sourceDirectories: string[], distDirectory: string, declarations: Declaration[]): Promise<void>;
    getBinaryPath(): Promise<string>;
    run(args: string[]): Promise<import("execa").ExecaReturnValue<string>>;
}
export { DenoCLI };
