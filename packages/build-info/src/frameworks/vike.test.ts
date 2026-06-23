import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a Vike site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vike dev',
        build: 'vike build',
        preview: 'vike build && vike preview',
      },
      dependencies: {
        vike: '^0.4.247',
        react: '^19.2.0',
        'react-dom': '^19.2.0',
        'vike-react': '^0.6.13',
      },
      devDependencies: {
        typescript: '^5.9.3',
        vite: '^7.2.6',
        '@vitejs/plugin-react': '^5.1.1',
        '@types/react': '^19.2.7',
        '@types/react-dom': '^19.2.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.length).toBe(1)

  expect(detected?.[0]?.id).toBe('vike')
  expect(detected?.[0]?.build?.command).toBe('vike build')
  expect(detected?.[0]?.build?.directory).toBe('dist/client')
  expect(detected?.[0]?.dev?.command).toBe('vike dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})
