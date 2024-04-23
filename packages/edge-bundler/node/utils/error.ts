// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNodeError = (error: any): error is NodeJS.ErrnoException => error instanceof Error

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFileNotFoundError = (error: any) => isNodeError(error) && error.code === 'ENOENT'
