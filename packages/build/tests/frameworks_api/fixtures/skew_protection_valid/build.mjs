import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/skew-protection.json', JSON.stringify({
  patterns: ["/api/*", "/dashboard/*"],
  sources: [
    { type: "cookie", name: "nf_deploy_id" },
    { type: "header", name: "x-nf-deploy-id" },
    { type: "query", name: "deploy_id" }
  ]
}))