import { join } from 'path'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { Environment } from '../file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import {
  Accuracy,
  type DetectedFramework,
  VersionAccuracy,
  mergeDetections,
  sortFrameworksBasedOnAccuracy,
} from './framework.js'
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
    name: 'blog',
    scripts: { dev: 'astro dev', build: 'astro build' },
    dependencies: { astro: '^1.5.1' },
  }),
  'packages/website/next.config.js': '',
  'packages/website/package.json': JSON.stringify({
    name: 'website',
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

test('should return an empty array when no framework is detected', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.gitkeep': '',
    'package.json': JSON.stringify({ name: 'test', version: '1.0.0' }),
  })
  const project = new Project(fs, cwd)
  const detection = await project.detectFrameworks()
  expect(detection).toHaveLength(0)
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

  test('node_modules version should override the one from the package.json', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ dependencies: { sapper: '*' } }),
      'node_modules/sapper/package.json': JSON.stringify({ version: '3.4.3' }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({
      id: 'sapper',
      version: {
        raw: '3.4.3',
      },
    })
  })

  test('should get the version from the node_modules for multiple frameworks', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ dependencies: { '@vue/cli-service': '*', vuepress: '*' } }),
      'node_modules/@vue/cli-service/package.json': JSON.stringify({ version: '1.2.3' }),
      'node_modules/vuepress/package.json': JSON.stringify({ version: '4.5.6' }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(2)
    expect(detection?.[0]).toMatchObject({
      id: 'vuepress',
      version: {
        raw: '4.5.6',
      },
    })
    expect(detection?.[1]).toMatchObject({
      id: 'vue',
      version: {
        raw: '1.2.3',
      },
    })
  })

  test('skip version from node_modules inside the browser', async ({ fs }) => {
    const cwd = mockFileSystem({
      ...eleventy,
      'node_modules/@11ty/eleventy/package.json': JSON.stringify({ version: '2.0.1' }),
    })
    vi.spyOn(fs, 'getEnvironment').mockImplementation(() => Environment.Browser)
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

  test('should get unknown version for a framework that is not detected by npm packages', async ({ fs }) => {
    const cwd = mockFileSystem({
      'config.rb': '',
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON()).toMatchObject({
      id: 'middleman',
      package: {
        name: undefined,
        version: 'unknown',
      },
    })
  })
})

describe('detected framework version accuracy', () => {
  test('should mark version from package.json with low accuracy', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { '@11ty/eleventy': '^2.0.0' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].detected.package?.versionAccuracy).toBe(VersionAccuracy.PackageJSON)
    expect(detection?.[0].toJSON().package).toMatchObject({
      name: '@11ty/eleventy',
      version: '2.0.0',
      versionAccuracy: VersionAccuracy.PackageJSON,
    })
  })

  test('should mark version from node_modules with high accuracy', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { '@11ty/eleventy': '^2.0.0' } }),
      'node_modules/@11ty/eleventy/package.json': JSON.stringify({ version: '2.0.1' }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].detected.package?.versionAccuracy).toBe(VersionAccuracy.NodeModules)
    expect(detection?.[0].toJSON().package).toMatchObject({
      name: '@11ty/eleventy',
      version: '2.0.1',
      versionAccuracy: VersionAccuracy.NodeModules,
    })
  })

  test('should not set version accuracy if no version is detected', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { '@11ty/eleventy': 'latest' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].detected.package?.versionAccuracy).toBeUndefined()
    expect(detection?.[0].toJSON().package.versionAccuracy).toBeUndefined()
  })

  test('should not set version accuracy for non-node.js frameworks', async ({ fs }) => {
    const cwd = mockFileSystem({
      'config.rb': '', // Middleman framework (no npm dependencies)
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].detected.package).toBeUndefined()
    expect(detection?.[0].toJSON().package).toMatchObject({
      version: 'unknown',
      versionAccuracy: undefined,
    })
  })

  test('should fall back to package.json accuracy in browser environment', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { '@11ty/eleventy': '^2.0.0' } }),
    })
    vi.spyOn(fs, 'getEnvironment').mockImplementation(() => Environment.Browser)
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].detected.package?.versionAccuracy).toBe(VersionAccuracy.PackageJSON)
    expect(detection?.[0].toJSON().package).toMatchObject({
      version: '2.0.0',
      versionAccuracy: VersionAccuracy.PackageJSON,
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

  test('keeps information about config and dependency from the most accurate detection that has it', () => {
    expect(
      mergeDetections([
        undefined,
        { accuracy: Accuracy.Config, config: '/absolute/path/config.js', configName: 'config.js' },
        { accuracy: Accuracy.NPMHoisted, package: { name: 'b' } },
        { accuracy: Accuracy.Forced },
        { accuracy: Accuracy.NPM, package: { name: 'a' } },
      ]),
    ).toMatchObject({
      // set by highest accuracy detection
      accuracy: Accuracy.Forced,
      // provided by the NPM detection - preferred over package provided by NPMHoisted
      package: { name: 'a' },
      // provided by the Config detection
      config: '/absolute/path/config.js',
      configName: 'config.js',
    })
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
      packages: [
        { path: join('packages/blog'), name: 'blog' },
        { path: join('packages/website'), name: 'website' },
      ],
      rootDir: cwd,
    })

    expect(detection).toHaveLength(2)
    expect(detection).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
    expect(project.frameworks.get(join('packages/blog'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/blog'))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
      ]),
    )

    expect(project.frameworks.get(join('packages/website'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/website'))).toEqual(
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
      packages: [
        { path: join('packages/blog'), name: 'blog' },
        { path: join('packages/website'), name: 'website' },
      ],
      rootDir: join(cwd, 'frontend'),
    })

    expect(detection).toHaveLength(2)
    expect(detection).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
    expect(project.frameworks.get(join('packages/blog'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/blog'))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
      ]),
    )

    expect(project.frameworks.get(join('packages/website'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/website'))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )
  })

  test('should detect the frameworks correctly from a base directory, but only run detection inside base dir', async (ctx) => {
    const cwd = mockFileSystem(PNPMWorkspace)
    ctx.fs.cwd = cwd
    const project = new Project(ctx.fs, join(cwd, 'packages/website'))
    const detection = await project.detectFrameworks()

    expect(project.workspace).toMatchObject({
      isRoot: false,
      packages: [
        { path: join('packages/blog'), name: 'blog' },
        { path: join('packages/website'), name: 'website' },
      ],
      rootDir: cwd,
    })

    expect(detection).toHaveLength(2)
    expect(detection).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )

    expect(project.frameworks.get(join('packages/website'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/website'))).toEqual(
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
      packages: [
        { path: join('packages/blog'), name: 'blog' },
        { path: join('packages/website'), name: 'website' },
      ],
      rootDir: join(cwd, 'frontend'), // The root of the js workspace is not the repo root
    })

    expect(detection).toHaveLength(2)
    expect(detection).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'astro',
        }),
        expect.objectContaining({
          id: 'next',
        }),
      ]),
    )

    expect(project.frameworks.get(join('packages/website'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/website'))).toEqual(
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

describe('detection of frameworks', () => {
  test('Should detect dependencies', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ name: 'test', version: '1.0.0', dependencies: { sapper: '*', other: '*' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({ id: 'sapper' })
  })

  test('Should detect devDependencies', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ name: 'test', version: '1.0.0', devDependencies: { sapper: '*', other: '*' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({ id: 'sapper' })
  })

  test('Should ignore empty framework.npmDependencies', async ({ fs }) => {
    const cwd = mockFileSystem({
      'config.rb': '',
      'package.json': JSON.stringify({ name: 'test', version: '1.0.0' }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({ id: 'middleman' })
  })

  test('Should detect any of several framework.npmDependencies', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ dependencies: { parcel: '*' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({ id: 'parcel' })
  })

  test('Should ignore if matching any framework.excludedNpmDependencies', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ dependencies: { sapper: '*', svelte: '*' } }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
  })

  test('Should detect config files', async ({ fs }) => {
    const cwd = mockFileSystem({
      'config.rb': '',
      'package.json': JSON.stringify({ name: 'test', version: '1.0.0' }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0]).toMatchObject({ id: 'middleman' })
  })
})

describe('dev commands', () => {
  test('Should use package scripts as dev command', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { other: 'testThree', start: 'testTwo', dev: 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run dev', 'npm run start'])
  })

  test('Should allow package scripts names with colons', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { 'docs:dev': 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run docs:dev'])
  })

  test('Should use Yarn when there is a yarn.lock', async ({ fs }) => {
    const cwd = mockFileSystem({
      'yarn.lock': '',
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { other: 'testThree', start: 'testTwo', dev: 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['yarn run dev', 'yarn run start'])
  })

  test('Should use PNPM when there is a pnpm-lock.yaml', async ({ fs }) => {
    const cwd = mockFileSystem({
      'pnpm-lock.yaml': '',
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { other: 'testThree', start: 'testTwo', dev: 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['pnpm run dev', 'pnpm run start'])
  })

  test('Should use package scripts as dev command', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { other: 'testThree', start: 'testTwo', dev: 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run dev', 'npm run start'])
  })

  test('Should allow package scripts names with colons', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { 'docs:dev': 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run docs:dev'])
  })

  test('Should only use package scripts if it includes framework.dev.commands', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { '@quasar/app': '*' },
        scripts: { another: 'test quasar dev -p 8081 test', other: 'testThree', start: 'testTwo', dev: 'test' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run another'])
  })

  test('Should default dev.commands to framework.dev.commands', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ dependencies: { sapper: '*' }, scripts: {} }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['sapper dev'])
  })

  test('Should sort scripts in the format *:<name>', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        scripts: { 'site:build': 'rollup -c', 'site:start': 'sirv public', 'site:dev': 'rollup -c -w' },
        devDependencies: { svelte: '^3.0.0' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run site:dev', 'npm run site:start'])
  })

  test('Should sort scripts when dev command is a substring of build command', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { 'parcel-bundler': '^1.12.4' },
        scripts: { build: 'parcel build index.html', dev: 'parcel index.html' },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run dev', 'npm run build'])
  })

  test('Should prioritize dev over serve', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite', build: 'vite build', serve: 'vite preview' },
        devDependencies: { vite: '^2.1.5' },
      }),
    })
    fs.cwd = cwd
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run dev', 'npm run serve', 'npm run build'])

    const settings = await project.getBuildSettings()
    expect(settings).toEqual([
      expect.objectContaining({
        buildCommand: 'npm run build',
        devCommand: 'npm run dev',
        dist: 'dist',
        framework: {
          id: 'vite',
          name: 'Vite',
        },
      }),
    ])
  })

  test(`Should exclude 'netlify dev' script`, async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { 'react-scripts': '*' },
        scripts: {
          dev: 'netlify dev',
          start: 'react-scripts start',
          test: 'react-scripts test',
          eject: 'react-scripts eject',
        },
      }),
    })
    const project = new Project(fs, cwd)
    const detection = await project.detectFrameworks()
    expect(detection).toHaveLength(1)
    expect(detection?.[0].toJSON().dev.commands).toEqual(['npm run start'])
  })
})
