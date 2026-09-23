import { parse as loadToml } from 'smol-toml'
import tomlify from 'tomlify-j0.4'

/**
 * Parse TOML. The result is round-tripped through JSON: `smol-toml` returns objects with a `null`
 * prototype, which some utilities mishandle, and dates become strings, which `netlify.toml` doesn't use.
 */
export const parseToml = function (configString: string): unknown {
  return JSON.parse(JSON.stringify(loadToml(configString)))
}

export const serializeToml = function (object: unknown): string {
  return tomlify.toToml(object, { space: 2, replace: serializeInteger })
}

// `tomlify-j0.4` serializes integers as floats, e.g. `200.0`, which breaks `redirects[*].status`.
const serializeInteger = function (_key: string | number, value: unknown): string | false {
  return Number.isInteger(value) ? String(value) : false
}
