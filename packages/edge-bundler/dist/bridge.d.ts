declare type LifecycleHook = () => void | Promise<void>;
interface DenoOptions {
    cacheDirectory?: string;
    onAfterDownload?: LifecycleHook;
    onBeforeDownload?: LifecycleHook;
    useGlobal?: boolean;
    versionRange?: string;
}
declare class DenoBridge {
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
    getBinaryPath(): Promise<string>;
    run(args: string[], { wait }?: {
        wait?: boolean;
    }): Promise<import("execa").ExecaReturnValue<string>>;
}
export { DenoBridge };
export type { LifecycleHook };
