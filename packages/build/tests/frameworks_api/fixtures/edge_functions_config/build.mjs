import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  edge_functions: [{ path: '/from-api', function: 'my_framework_edge' }],
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))
