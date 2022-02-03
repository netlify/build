import { Handler } from './handler.js';
declare const findHandlers: (directories: string[]) => Promise<Handler[]>;
export { findHandlers };
