import { beforeEach, describe, expect, test, vi } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { join } from '../file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import { Accuracy, DetectedFramework, mergeDetections, sortFrameworksBasedOnAccuracy } from './framework.js'
import { Grunt } from './grunt.js'
import { Gulp } from './gulp.js'
import { Hexo } from './hexo.js'
import { Hydrogen } from './hydrogen.js'
import { Jekyll } from './jekyll.js'
import { Next } from './next.js'
import { Vite } from './vite.js'

const PNPMWorkspace: Record<string, string> = {
  'pnpm-workspace.yaml': `packages:\n- packages/*`,
  'package.json': JSON.stringify({ packageManager: 'pnpm@7.14.2' }),
  'packages/blog/package.json': JSON.stringify({
    scripts: { dev: 'astro dev', build: 'astro build' },
    dependencies: { astro: '^1.5.1' },
  }),
  'packages/website/next.config.js': '',
  'packages/website/package.json': JSON.stringify({
    scripts: { dev: 'next dev', build: 'next build' },
    dependencies: { next: '~12.3.1', react: '18.2.9', 'react-dom': '18.2.9' },
  }),
}

// nest the javascript workspace in a frontend folder (imitating a larger monorepo)
const nestedPNPMWorkspace = Object.entries(PNPMWorkspace).reduce(
  (prev, [key, value]) => ({
    ...prev,
    [`frontend/${key}`]: value,
  }),
  {
    'backend/main.go': '', // backend
    '.editorconfig': '', // repository root
  },
)

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('detect framework version', () => {
  const eleventy: Record<string, string> = {
    'package.json': JSON.stringify({ devDependencies: { '@11ty/eleventy': '^2.0.0' } }),
    'eleventy.config.js': '',
  }

  test('get unknown framework version', async ({ fs }) => {
    const cwd = mockFileSystem({
      ...eleventy,
      'package.json': JSON.stringify({ devDependencies: { '@11ty/eleventy': 'latest' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({
      id: 'eleventy',
      version: undefined,
    })
  })

  test('get framework version from package.json', async ({ fs }) => {
    const cwd = mockFileSystem(eleventy)
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({
      id: 'eleventy',
      version: {
        raw: '2.0.0',
      },
    })
  })

  test('get framework version from node_modules', async ({ fs }) => {
    const cwd = mockFileSystem({
      ...eleventy,
      'node_modules/@11ty/eleventy/package.json': JSON.stringify({ version: '2.0.1' }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({
      id: 'eleventy',
      version: {
        raw: '2.0.1',
      },
    })
  })

  test('skip version from node_modules inside the browser', async ({ fs }) => {
    const cwd = mockFileSystem({
      ...eleventy,
      'node_modules/@11ty/eleventy/package.json': JSON.stringify({ version: '2.0.1' }),
    })
    vi.spyOn(fs, 'getEnvironment').mockImplementation(() => 'browser')
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({
      id: 'eleventy',
      version: {
        raw: '2.0.0', // fallback to the version from the package.json
      },
    })
  })
})

describe('detection merging', () => {
  test('return undefined if no detection is provided', () => {
    expect(mergeDetections([undefined, undefined])).toBeUndefined()
  })

  test('merge a list of detections and prefer the config over a hoisted npm dependency', () => {
    expect(
      mergeDetections([
        undefined,
        { accuracy: Accuracy.NPMHoisted, package: { name: 'b' } },
        { accuracy: Accuracy.Config, package: { name: 'c' } },
      ]),
    ).toMatchObject({ accuracy: Accuracy.Config, package: { name: 'c' } })
  })

  test('merge a list of detections and prefer the NPM direct match', () => {
    expect(
      mergeDetections([
        undefined,
        { accuracy: Accuracy.NPM, package: { name: 'a' } },
        { accuracy: Accuracy.NPMHoisted, package: { name: 'b' } },
        { accuracy: Accuracy.Config, package: { name: 'c' } },
      ]),
    ).toMatchObject({ accuracy: Accuracy.NPM, package: { name: 'a' } })
  })
})

describe('framework sorting based on accuracy and type', () => {
  let project: Project

  beforeEach(({ fs }) => {
    project = new Project(fs)
  })

  test('should prefer config only detection over config', () => {
    const sorted: DetectedFramework[] = [
      new Hexo(project).setDetected(Accuracy.Config, ''),
      new Jekyll(project).setDetected(Accuracy.ConfigOnly, ''),
    ].sort(sortFrameworksBasedOnAccuracy)
    expect(sorted[0].id).toBe('jekyll')
    expect(sorted[1].id).toBe('hexo')
  })

  test('should sort by accuracy', () => {
    const sorted: DetectedFramework[] = [
      new Hexo(project).setDetected(Accuracy.Config, ''),
      new Next(project).setDetected(Accuracy.NPM, { name: 'next' }),
      new Jekyll(project).setDetected(Accuracy.ConfigOnly, ''),
    ].sort(sortFrameworksBasedOnAccuracy)

    expect(sorted[0].id).toBe('next')
    expect(sorted[1].id).toBe('jekyll')
    expect(sorted[2].id).toBe('hexo')
  })

  test('should prefer static site generators over build tools but still prefer accuracy over type', () => {
    const sorted: DetectedFramework[] = [
      new Gulp(project).setDetected(Accuracy.NPM, { name: 'gulp' }),
      new Vite(project).setDetected(Accuracy.NPM, { name: 'vite' }),
      new Hexo(project).setDetected(Accuracy.Config, ''),
      new Hydrogen(project).setDetected(Accuracy.NPM, { name: '@shopify/hydrogen' }),
    ].sort(sortFrameworksBasedOnAccuracy)

    expect(sorted[0].id).toBe('hydrogen')
    expect(sorted[1].id).toBe('gulp')
    expect(sorted[2].id).toBe('vite')
    expect(sorted[3].id).toBe('hexo')
  })

  test('should keep the provided order when they have the same accuracy and type', () => {
    const sorted: DetectedFramework[] = [
      new Grunt(project).setDetected(Accuracy.NPM, { name: 'grunt' }),
      new Gulp(project).setDetected(Accuracy.NPM, { name: 'gulp' }),
      new Vite(project).setDetected(Accuracy.NPM, { name: 'vite' }),
    ].sort(sortFrameworksBasedOnAccuracy)

    expect(sorted[0].id).toBe('grunt')
    expect(sorted[1].id).toBe('gulp')
    expect(sorted[2].id).toBe('vite')
  })
})

describe('workspace detection', () => {
  test('should detect the frameworks correctly from a pnpm workspace repository root', async ({ fs }) => {
    const cwd = mockFileSystem(PNPMWorkspace)
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()

    expect(project.workspace).toMatchObject({
      isRoot: true,
      packages: ['packages/blog', 'packages/website'],
      rootDir: cwd,
    })

    expect(detection).toHaveLength(2)
    expect(detection?.[0]).toMatchObject({
      id: 'astro',
    })
    expect(project.frameworks.get('packages/blog')).toHaveLength(1)
    expect(project.frameworks.get('packages/blog')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
      ]),
    )

    expect(detection?.[1]).toMatchObject({
      id: 'next',
    })
    expect(project.frameworks.get('packages/website')).toHaveLength(1)
    expect(project.frameworks.get('packages/website')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
  })

  test('should detect the frameworks correctly from a pnpm workspace in a nested repository structure', async ({
    fs,
  }) => {
    const cwd = mockFileSystem(nestedPNPMWorkspace)
    const project = new Project(fs, join(cwd, 'frontend'), cwd)
    const detection = await project.detectFrameworks()

    expect(project.workspace).toMatchObject({
      isRoot: true,
      packages: ['packages/blog', 'packages/website'],
      rootDir: join(cwd, 'frontend'),
    })

    expect(detection).toHaveLength(2)
    expect(detection?.[0]).toMatchObject({
      id: 'astro',
    })
    expect(project.frameworks.get('packages/blog')).toHaveLength(1)
    expect(project.frameworks.get('packages/blog')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
      ]),
    )

    expect(detection?.[1]).toMatchObject({
      id: 'next',
    })
    expect(project.frameworks.get('packages/website')).toHaveLength(1)
    expect(project.frameworks.get('packages/website')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
  })

  test('should detect the frameworks correctly from a base directory, but only run detection inside base dir', async ({
    fs,
  }) => {
    const cwd = mockFileSystem(PNPMWorkspace)
    const project = new Project(fs, join(cwd, 'packages/website'))
    const detection = await project.detectFrameworks()

    expect(project.workspace).toMatchObject({
      isRoot: false,
      packages: ['packages/blog', 'packages/website'],
      rootDir: cwd,
    })

    expect(detection).toHaveLength(1)

    expect(detection?.[0]).toMatchObject({
      id: 'next',
    })
    expect(project.frameworks.get('packages/website')).toHaveLength(1)
    expect(project.frameworks.get('packages/website')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
  })

  test('should detect the frameworks correctly from a base directory, in a nested project', async ({ fs }) => {
    const cwd = mockFileSystem(nestedPNPMWorkspace)
    const project = new Project(fs, join(cwd, 'frontend/packages/website'))
    const detection = await project.detectFrameworks()

    expect(project.workspace).toMatchObject({
      isRoot: false,
      packages: ['packages/blog', 'packages/website'],
      rootDir: join(cwd, 'frontend'), // The root of the js workspace is not the repo root
    })

    expect(detection).toHaveLength(1)

    expect(detection?.[0]).toMatchObject({
      id: 'next',
    })
    expect(project.frameworks.get('packages/website')).toHaveLength(1)
    expect(project.frameworks.get('packages/website')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
  })

  test('should detect jekyll inside a non js workspace', async ({ fs }) => {
    const cwd = mockFileSystem({
      'frontend/_config.yml': '',
      'backend/main.go': '',
    })
    const project = new Project(fs, join(cwd, 'frontend'))
    const detection = await project.detectFrameworks()

    expect(project.workspace).toBeNull()
    // should not match hexo as it has a lower accuracy
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({
      id: 'jekyll',
    })
    expect(project.frameworks.get('')).toHaveLength(1)
    expect(project.frameworks.get('')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'jekyll',
        }),
      ]),
    )
  })
})
