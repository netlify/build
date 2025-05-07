export const ensureArray = <T>(input: T | T[]) => (Array.isArray(input) ? input : [input])
