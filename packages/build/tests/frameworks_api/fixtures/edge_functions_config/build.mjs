import { mkdir, writeFile } from 'node:fs/promises'

const config = {
  edge_functions: [
    {
      function: 'my_framework_edge',
      name: 'My framework edge function',
      generator: 'package-name@1.2.3',
      path: '/from-api/*',
      excludedPath: ['/from-api/static/*', '/from-api/skip'],
      cache: 'manual',
      method: ['GET', 'POST'],
      header: { 'x-custom': true },
    },
  ],
}

await mkdir('.netlify/v1', { recursive: true })

await writeFile('.netlify/v1/config.json', JSON.stringify(config))
