import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1', { recursive: true })

await writeFile(
  '.netlify/v1/config.json',
  JSON.stringify({
    edge_functions: [
      {
        function: 'hello',
        // not supported by the schema
        path: false,
      },
    ],
  }),
)
