declare module 'tomlify-j0.4' {
  interface Options {
    space?: number
    replace?: (key: string, value: any) => any
  }
  function toToml(obj: any, options?: Options): string
  export default { toToml }
}
