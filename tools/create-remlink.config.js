import { writeFile } from 'node:fs/promises'

const config = {
  links: [
    {
      repo: 'netlify/build',
      branch: process.env.BRANCH || 'main',
      packages: {
        '@netlify/config': 'packages/config',
        '@netlify/build': 'packages/build',
        '@netlify/zip-it-and-ship-it': 'packages/zip-it-and-ship-it',
        '@netlify/build-info': 'packages/build-info',
      },
      installCommands: ['npm run build'],
    },
  ],
}

await writeFile('remlink.config.json', JSON.stringify(config), 'utf-8')
