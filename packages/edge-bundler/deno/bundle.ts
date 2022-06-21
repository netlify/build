import { writeStage2 } from 'https://62ac9c589c16c50008b6ef55--edge-bootstrap.netlify.app/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions } = JSON.parse(payload)

await writeStage2({ basePath, functions, destPath })
