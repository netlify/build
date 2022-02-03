import { join } from 'path';
import envPaths from 'env-paths';
const OSBasedPaths = envPaths('netlify', { suffix: '' });
const getPathInHome = (path) => join(OSBasedPaths.config, path);
export { getPathInHome };
