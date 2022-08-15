import { writeStage2 } from 'https://62f5f45fbc76ed0009624267--edge.netlify.com/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions, imports } = JSON.parse(payload)

await writeStage2({ basePath, destPath, functions, imports })
