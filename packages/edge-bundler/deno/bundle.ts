import { writeStage2 } from 'https://dinosaurs:are-the-future!@deploy-preview-20--edge-bootstrap.netlify.app/bundler/mod.ts'

const [payload] = Deno.args
const { basePath, destPath, functions } = JSON.parse(payload)

await writeStage2({ basePath, functions, destPath })
