/** An empty string counts as unset, e.g. an environment variable or a flag set to `''`. */
export const nonEmpty = (value: string | undefined) => (value === '' ? undefined : value)
