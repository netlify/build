import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('dist/.netlify/blobs/deploy', { recursive: true })

await Promise.all([
  writeFile('dist/.netlify/blobs/deploy/with-metadata.txt', 'another value'),
  writeFile('dist/.netlify/blobs/deploy/$with-metadata.txt.json', 'this is not json'),
])