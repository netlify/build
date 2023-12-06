import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/blobs/deploy', { recursive: true })

await Promise.all([
  writeFile('.netlify/blobs/deploy/with-metadata.txt', 'another value'),
  writeFile('.netlify/blobs/deploy/$with-metadata.txt.json', 'this is not json'),
])
