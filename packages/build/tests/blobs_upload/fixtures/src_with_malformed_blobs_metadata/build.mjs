import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1/blobs/deploy', { recursive: true })

await Promise.all([
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt', 'another value'),
  writeFile('.netlify/v1/blobs/deploy/$with-metadata.txt.json', 'this is not json'),
])
