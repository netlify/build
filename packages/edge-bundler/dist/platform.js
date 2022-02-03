import { arch, platform } from 'process';
const getBinaryExtension = () => (platform === 'win32' ? '.exe' : '');
const getPlatformTarget = () => {
    if (platform === 'win32') {
        return 'x86_64-pc-windows-msvc';
    }
    const isArm64 = arch === 'arm64';
    if (platform === 'darwin') {
        return isArm64 ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
    }
    return 'x86_64-unknown-linux-gnu';
};
export { getBinaryExtension, getPlatformTarget };
