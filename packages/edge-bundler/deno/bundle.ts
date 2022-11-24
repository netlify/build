import { writeStage2 } from './lib/stage2.ts'

const [payload] = Deno.args
const { basePath, destPath, externals, functions, importMapURL } = JSON.parse(payload)

await writeStage2({ basePath, destPath, externals, functions, importMapURL })
