import { writeStage2 } from 'https://625844cdcdd28b0008829757--edge-bootstrap.netlify.app/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions } = JSON.parse(payload)

await writeStage2({ basePath, functions, destPath })
