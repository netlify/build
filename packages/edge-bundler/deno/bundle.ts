import { writeStage2 } from 'https://62ea8d05a6858300091547ed--edge.netlify.com/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions, imports } = JSON.parse(payload)

await writeStage2({ basePath, destPath, functions, imports })
