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

if (typeof func.default !== 'function') {
  Deno.exit(exitCodes.InvalidDefaultExport)
}

if (func.config === undefined) {
  Deno.exit(exitCodes.NoConfig)
}

if (typeof func.config !== 'object') {
  Deno.exit(exitCodes.InvalidExport)
}

try {
  const result = JSON.stringify(func.config)

  await Deno.writeTextFile(new URL(collectorURL), result)
} catch (error) {
  console.error(error)

  Deno.exit(exitCodes.SerializationError)
}

Deno.exit(exitCodes.Success)
