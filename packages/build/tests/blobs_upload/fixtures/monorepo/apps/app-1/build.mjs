import { mkdir, writeFile } from 'node:fs/promises'

await Promise.all([
  mkdir('.netlify/v1/blobs/deploy/something.txt', { recursive: true }),
  mkdir('.netlify/v1/blobs/deploy/with-metadata.txt', { recursive: true }),
  mkdir('.netlify/v1/blobs/deploy/nested/file.txt', { recursive: true }),
  mkdir('dist', { recursive: true }),
]);

await Promise.all([
  writeFile('dist/index.html', '<h1>Hello World</h1>'),
  writeFile('.netlify/v1/blobs/deploy/something.txt/blob', 'some value'),
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt/blob', 'another value'),
  writeFile('.netlify/v1/blobs/deploy/with-metadata.txt/blob.meta.json', JSON.stringify({ "meta": "data", "number": 1234 })),
  writeFile('.netlify/v1/blobs/deploy/nested/file.txt/blob', 'file value'),
  writeFile('.netlify/v1/blobs/deploy/nested/file.txt/blob.meta.json', JSON.stringify({ "some": "metadata" })),
])

