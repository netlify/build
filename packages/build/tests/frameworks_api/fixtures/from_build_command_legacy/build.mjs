import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  "images": {
    "remote_images": ["domain1.from-api.netlify", "domain2.from-api.netlify"]
  }
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))