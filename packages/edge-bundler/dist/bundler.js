import { promises as fs } from 'fs';
import { join, relative } from 'path';
import { DenoBridge } from './bridge.js';
import { findHandlers } from './finder.js';
import { generateManifest } from './manifest.js';
import { getStringHash } from './utils/sha256.js';
const bundle = async (sourceDirectories, distDirectory, declarations = [], { onAfterDownload, onBeforeDownload } = {}) => {
    const deno = new DenoBridge({
        onAfterDownload,
        onBeforeDownload,
    });
    const { entrypointHash, handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory);
    const bundleFilename = `${entrypointHash}.js`;
    const bundlePath = join(distDirectory, bundleFilename);
    const manifest = await writeManifest(bundleFilename, handlers, distDirectory, declarations);
    await deno.run(['bundle', preBundlePath, bundlePath]);
    await fs.unlink(preBundlePath);
    return { bundlePath, handlers, manifest, preBundlePath };
};
const generateEntrypoint = (handlers, distDirectory) => {
    const lines = handlers.map((handler, index) => generateHandlerReference(handler, index, distDirectory));
    const bootImport = 'import { boot } from "https://dinosaurs:are-the-future!@edge-bootstrap.netlify.app/index.ts";';
    const importLines = lines.map(({ importLine }) => importLine).join('\n');
    const exportLines = lines.map(({ exportLine }) => exportLine).join(', ');
    const exportDeclaration = `const handlers = {${exportLines}};`;
    const defaultExport = 'boot(handlers);';
    return [bootImport, importLines, exportDeclaration, defaultExport].join('\n\n');
};
const generateHandlerReference = (handler, index, targetDirectory) => {
    const importName = `handler${index}`;
    const exportLine = `"${handler.name}": ${importName}`;
    const relativePath = relative(targetDirectory, handler.path);
    return {
        exportLine,
        importLine: `import ${importName} from "${relativePath}";`,
    };
};
const preBundle = async (sourceDirectories, distDirectory) => {
    await fs.rm(distDirectory, { force: true, recursive: true });
    await fs.mkdir(distDirectory, { recursive: true });
    const handlers = await findHandlers(sourceDirectories);
    const entrypoint = generateEntrypoint(handlers, distDirectory);
    const entrypointHash = getStringHash(entrypoint);
    const preBundlePath = join(distDirectory, `${entrypointHash}-pre.js`);
    await fs.writeFile(preBundlePath, entrypoint);
    return {
        entrypointHash,
        handlers,
        preBundlePath,
    };
};
const writeManifest = (bundleFilename, handlers, distDirectory, declarations = []) => {
    const manifest = generateManifest(bundleFilename, handlers, declarations);
    const manifestPath = join(distDirectory, 'manifest.json');
    return fs.writeFile(manifestPath, JSON.stringify(manifest));
};
export { bundle, preBundle };
