import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1/blobs/deploy/something.txt', { recursive: true })
await mkdir('.netlify/v1/blobs/deploy/with-metadata.txt', { recursive: true })
await mkdir('.netlify/v1/blobs/deploy/nested/blob', { recursive: true })
await mkdir('.netlify/v1/blobs/deploy/another-directory/blob', { recursive: true })

await Promise.all([
  writeFile('.netlify/v1/blobs/deploy/something.txt/blob', 'some value'),

  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt/blob', 'another value'),
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt/blob.meta.json', JSON.stringify({ meta: "data", number: 1234 })),

  writeFile('.netlify/v1/blobs/deploy/nested/blob/blob', 'file value'),
  writeFile('.netlify/v1/blobs/deploy/nested/blob/blob.meta.json', JSON.stringify({ some: "metadata" })),
])
