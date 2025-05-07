export const isNodeError = (error: any): error is NodeJS.ErrnoException => error instanceof Error

export const isFileNotFoundError = (error: any) => isNodeError(error) && error.code === 'ENOENT'
