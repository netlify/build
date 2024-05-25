import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1/blobs/deploy/nested', { recursive: true })

await Promise.all([
  writeFile('.netlify/v1/blobs/deploy/something.txt', 'some value'),
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt', 'another value'),
  writeFile('.netlify/v1/blobs/deploy/$with-metadata.txt.json', JSON.stringify({ "meta": "data", "number": 1234 })),
  writeFile('.netlify/v1/blobs/deploy/nested/file.txt', 'file value'),
  writeFile('.netlify/v1/blobs/deploy/nested/$file.txt.json', JSON.stringify({ "some": "metadata" })),
])
