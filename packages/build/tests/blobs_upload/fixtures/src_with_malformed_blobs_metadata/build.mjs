import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1/blobs/deploy/with-metadata.txt', { recursive: true })

await Promise.all([
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt/blob', 'another value'),
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt/blob.meta.json', 'this is not json'),
])
