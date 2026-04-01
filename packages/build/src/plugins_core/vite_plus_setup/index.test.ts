import { homedir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, test, vi, beforeEach } from 'vitest'

import { hasVitePlusPackage, getVitePlusVersion, installVitePlusCli } from './index.js'

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ exitCode: 0 }),
}))

vi.mock('../../utils/package.js', () => ({
  getPackageJson: vi.fn().mockResolvedValue({ packageJson: {} }),
}))

import { execa } from 'execa'
import { getPackageJson } from '../../utils/package.js'

const mockedExeca = vi.mocked(execa)
const mockedGetPackageJson = vi.mocked(getPackageJson)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('hasVitePlusPackage', () => {
  test('returns true when vite-plus is in dependencies', () => {
    expect(hasVitePlusPackage({ dependencies: { 'vite-plus': '^1.0.0' } })).toBe(true)
  })

  test('returns true when vite-plus is in devDependencies', () => {
    expect(hasVitePlusPackage({ devDependencies: { 'vite-plus': '^1.0.0' } })).toBe(true)
  })

  test('returns false when vite-plus is not present', () => {
    expect(hasVitePlusPackage({ dependencies: { vue: '^3.0.0' } })).toBe(false)
  })

  test('returns false for empty package.json', () => {
    expect(hasVitePlusPackage({})).toBe(false)
  })
})

describe('getVitePlusVersion', () => {
  test('returns version from root devDependencies', async () => {
    mockedGetPackageJson.mockResolvedValueOnce({
      packageJson: { devDependencies: { 'vite-plus': '^2.0.0' } },
    })

    expect(await getVitePlusVersion('/project')).toBe('^2.0.0')
  })

  test('returns version from root dependencies', async () => {
    mockedGetPackageJson.mockResolvedValueOnce({
      packageJson: { dependencies: { 'vite-plus': '1.5.0' } },
    })

    expect(await getVitePlusVersion('/project')).toBe('1.5.0')
  })

  test('prefers devDependencies over dependencies', async () => {
    mockedGetPackageJson.mockResolvedValueOnce({
      packageJson: {
        dependencies: { 'vite-plus': '1.0.0' },
        devDependencies: { 'vite-plus': '2.0.0' },
      },
    })

    expect(await getVitePlusVersion('/project')).toBe('2.0.0')
  })

  test('falls back to workspace package.json', async () => {
    mockedGetPackageJson.mockResolvedValueOnce({ packageJson: {} })
    mockedGetPackageJson.mockResolvedValueOnce({
      packageJson: { devDependencies: { 'vite-plus': '3.0.0' } },
    })

    expect(await getVitePlusVersion('/project', 'packages/app')).toBe('3.0.0')
  })

  test('returns latest when not found anywhere', async () => {
    mockedGetPackageJson.mockResolvedValueOnce({ packageJson: {} })

    expect(await getVitePlusVersion('/project')).toBe('latest')
  })

  test('returns latest when not found in workspace either', async () => {
    mockedGetPackageJson.mockResolvedValueOnce({ packageJson: {} })
    mockedGetPackageJson.mockResolvedValueOnce({ packageJson: {} })

    expect(await getVitePlusVersion('/project', 'packages/app')).toBe('latest')
  })
})

describe('installVitePlusCli', () => {
  test('calls curl with the install script', async () => {
    await installVitePlusCli('1.0.0')

    expect(mockedExeca).toHaveBeenCalledWith('bash', ['-c', 'curl -fsSL https://vite.plus | bash'], {
      env: expect.objectContaining({
        VP_VERSION: '1.0.0',
        VITE_PLUS_VERSION: '1.0.0',
      }),
      stdio: 'pipe',
    })
  })

  test('passes latest as version env vars', async () => {
    await installVitePlusCli('latest')

    expect(mockedExeca).toHaveBeenCalledWith(
      'bash',
      expect.any(Array),
      expect.objectContaining({
        env: expect.objectContaining({
          VP_VERSION: 'latest',
          VITE_PLUS_VERSION: 'latest',
        }),
      }),
    )
  })

  test('returns the vite-plus bin directory', async () => {
    const binDir = await installVitePlusCli('1.0.0')

    expect(binDir).toBe(join(homedir(), '.vite-plus', 'bin'))
  })
})
