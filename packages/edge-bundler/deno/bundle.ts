import { writeStage2 } from 'https://62d144a15553b50009af7ac6--edge.netlify.com/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions, imports } = JSON.parse(payload)

await writeStage2({ basePath, destPath, functions, imports })
