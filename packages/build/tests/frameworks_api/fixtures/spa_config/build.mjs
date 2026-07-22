import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  build: {
    spa: true,
  },
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))
