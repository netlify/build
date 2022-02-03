import globToRegExp from 'glob-to-regexp';
import { nonNullable } from './utils/non_nullable.js';
const generateManifest = (bundlePath, handlers, declarations = []) => {
    const handlersWithRoutes = handlers.map((handler) => {
        const declaration = declarations.find((candidate) => candidate.handler === handler.name);
        if (declaration === undefined) {
            return;
        }
        const pattern = 'pattern' in declaration ? new RegExp(declaration.pattern) : globToRegExp(declaration.path);
        const serializablePattern = pattern.source.replace(/\\\//g, '/');
        return {
            handler: handler.name,
            pattern: serializablePattern,
        };
    });
    const manifest = {
        bundle: bundlePath,
        handlers: handlersWithRoutes.filter(nonNullable),
    };
    return manifest;
};
export { generateManifest };
