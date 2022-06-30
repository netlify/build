import { writeStage2 } from 'https://62bae4994570970008142f1e--edge-bootstrap.netlify.app/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions } = JSON.parse(payload)

await writeStage2({ basePath, functions, destPath })
