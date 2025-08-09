const [functionURL, collectorURL, bootstrapURL, rawExitCodes] = Deno.args
const exitCodes = JSON.parse(rawExitCodes)

let func

try {
  const {Netlify} = await import(new URL("/bootstrap/globals/implementation.ts", bootstrapURL).toString())
  globalThis.Netlify = Netlify
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
