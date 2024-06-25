import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  images: {
    remote_images: ["domain3.netlify", "domain4.netlify"]
  }
}

await mkdir('.netlify/v1', { recursive: true });
await writeFile('.netlify/v1/config.json', JSON.stringify(config));
