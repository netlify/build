import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  "functions": {
    "my_framework*": {
      "included_files": ["files/**"]
    }
  },
  "redirects": [
    {
      "from": "/from-config",
      "to": "/to-config",
      "status": 418,
      "force": true
    }
  ],
  "redirects!": [
    {
      "from": "/from-config-override",
      "to": "/to-config-override",
      "status": 418,
      "force": true
    }
  ],
  "images": {
    "remote_images": ["domain1.from-api.netlify", "domain2.from-api.netlify"]
  }
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))