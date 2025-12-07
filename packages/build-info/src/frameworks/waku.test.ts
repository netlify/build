import { beforeEach, expect, test, describe } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

const packageJson = JSON.stringify({
  scripts: {
    dev: 'waku dev',
    build: 'waku build',
    start: 'waku start',
  },
  dependencies: {
    react: '~19.2.1',
    'react-dom': '~19.2.1',
    'react-server-dom-webpack': '~19.2.1',
    waku: '0.27.3',
  },
  devDependencies: {
    '@tailwindcss/vite': '^4.1.17',
    '@types/react': '^19.2.7',
    '@types/react-dom': '^19.2.3',
    '@vitejs/plugin-react': '^5.1.0',
    'babel-plugin-react-compiler': '^1.0.0',
    tailwindcss: '^4.1.17',
    typescript: '^5.9.3',
  },
})

describe('waku', () => {
  test('should detect waku', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': packageJson,
      'waku.config.ts': '',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('waku')
    expect(detected?.[0].build.command).toBe('waku build')
    expect(detected?.[0].build.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBe('waku dev')
  })

  test('should not detect react', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': packageJson,
      'waku.config.ts': '',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
    expect(detectedFrameworks).not.toContain('react')
  })
})
