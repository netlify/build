import { type NetlifyGlobal } from 'https://edge.netlify.com/bootstrap/globals/types.ts'

const [functionURL, collectorURL, rawExitCodes] = Deno.args
const exitCodes = JSON.parse(rawExitCodes)

const env = {
  delete: Deno.env.delete,
  get: Deno.env.get,
  has: Deno.env.has,
  set: Deno.env.set,
  toObject: Deno.env.toObject,
};

const Netlify: NetlifyGlobal = {
  get context() {
    return null;
  },
  env,
};

globalThis.Netlify = Netlify

let func

try {
  func = await import(functionURL)
} catch (error) {
  console.error(error)

  Deno.exit(exitCodes.ImportError)
}

// https://fetchable.org: an object default export with a `fetch` method.
const isFetchable = typeof func.default === 'object' && func.default !== null && typeof func.default.fetch === 'function'

if (typeof func.default !== 'function' && !isFetchable) {
  Deno.exit(exitCodes.InvalidDefaultExport)
}

// A named `config` export wins over `default.config`.
const config = func.config ?? (isFetchable ? func.default.config : undefined)

if (config === undefined) {
  Deno.exit(exitCodes.NoConfig)
}

if (typeof config !== 'object') {
  Deno.exit(exitCodes.InvalidExport)
}

try {
  const result = JSON.stringify(config)

  await Deno.writeTextFile(new URL(collectorURL), result)
} catch (error) {
  console.error(error)

  Deno.exit(exitCodes.SerializationError)
}

Deno.exit(exitCodes.Success)
