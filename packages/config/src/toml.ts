import { parse } from 'smol-toml'
import tomlify from 'tomlify-j0.4'

import type { RawConfig } from './types.js'

// A TOML document is always a table. Going through JSON turns dates into strings, `nan` and `inf`
// into `null`, and gives objects the usual prototype.
export const parseToml = function (text: string): RawConfig {
  return JSON.parse(JSON.stringify(parse(text))) as RawConfig
}

export const serializeToml = function (value: unknown): string {
  return tomlify.toToml(value, { space: 2, replace: serializeInteger })
}

// `tomlify-j0.4` serializes integers as floats, e.g. `200.0`, which breaks `redirects[*].status`.
const serializeInteger = (_key: string | number, value: unknown): string | false =>
  Number.isInteger(value) ? String(value) : false
