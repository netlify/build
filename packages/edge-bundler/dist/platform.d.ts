declare const getBinaryExtension: () => ".exe" | "";
declare const getPlatformTarget: () => "x86_64-pc-windows-msvc" | "aarch64-apple-darwin" | "x86_64-apple-darwin" | "x86_64-unknown-linux-gnu";
export { getBinaryExtension, getPlatformTarget };
