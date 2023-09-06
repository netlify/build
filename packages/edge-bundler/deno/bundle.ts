import { writeStage2 } from './lib/stage2.ts'

const [payload] = Deno.args
const { basePath, destPath, externals, functions, importMapData } = JSON.parse(payload)

try {
  await writeStage2({ basePath, destPath, externals, functions, importMapData })
} catch (error) {
  if (error instanceof Error && error.message.includes("The module's source code could not be parsed")) {
    delete error.stack
  }

  throw error
}
