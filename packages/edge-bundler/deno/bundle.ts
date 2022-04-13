import { writeStage2 } from 'https://dinosaurs:are-the-future!@6256b369f54728000a74a8d5--edge-bootstrap.netlify.app/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions } = JSON.parse(payload)

await writeStage2({ basePath, functions, destPath })
