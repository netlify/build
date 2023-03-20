export default class ManifestValidationError extends Error {
  customErrorInfo = {
    type: 'functionsBundling',
  }

  constructor(message: string | undefined) {
    super(`Validation of Edge Functions manifest failed\n${message}`)

    this.name = 'ManifestValidationError'

    // https://github.com/microsoft/TypeScript-wiki/blob/0fecbda7263f130c57394d779b8ca13f0a2e9123/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ManifestValidationError.prototype)
  }
}
