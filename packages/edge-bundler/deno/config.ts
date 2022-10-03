const [functionURL, collectorURL, rawExitCodes] = Deno.args
const exitCodes = JSON.parse(rawExitCodes)

let func

try {
  func = await import(functionURL)
} catch (error) {
  console.error(error)

  Deno.exit(exitCodes.ImportError)
}

if (func.config === undefined) {
  Deno.exit(exitCodes.NoConfig)
}

if (typeof func.config !== 'function') {
  Deno.exit(exitCodes.InvalidExport)
}

let config

try {
  config = await func.config()
} catch (error) {
  console.error(error)

  Deno.exit(exitCodes.RuntimeError)
}

try {
  const result = JSON.stringify(config)

  await Deno.writeTextFile(new URL(collectorURL), result)
} catch (error) {
  console.error(error)

  Deno.exit(exitCodes.SerializationError)
}

Deno.exit(exitCodes.Success)
