declare module 'tomlify-j0.4' {
  interface ToTomlOptions {
    space?: number | string
    /** Return a string to serialize the value as that raw TOML, or `false` to use the default. */
    replace?: (key: string | number, value: unknown) => string | false
  }

  const tomlify: {
    toToml(value: unknown, options?: ToTomlOptions): string
  }
  export default tomlify
}
