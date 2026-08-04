import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  spa_fallback: true,
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))
