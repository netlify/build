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
    getCachedBinary(): Promise<string | undefined>;
    getGlobalBinary(): Promise<"deno" | undefined>;
    getRemoteBinary(): Promise<string>;
    getBinaryPath(): Promise<string>;
    run(args: string[]): Promise<import("execa").ExecaReturnValue<string>>;
    writeVersionFile(version: string): Promise<void>;
}
export { DenoBridge };
