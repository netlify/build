import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  "plugins": [
    {
      "package": "@netlify/imaginary-plugin"
    }
  ],
  "images": {
    "remote_images": ["domain1.netlify", "domain2.netlify"]
  }
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))