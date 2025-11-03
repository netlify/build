import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/skew-protection.json', `{"patterns":`)