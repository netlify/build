import { describe, expect, test } from 'vitest'

import { getFrameworks, getFramework, hasFramework } from './helpers/main.js'

describe('getFrameworks', () => {
  test('Should detect frameworks', async () => {
    const frameworks = await getFrameworks('simple')
    expect(frameworks).toMatchSnapshot()
  })

  test('Should return an empty array when no framework is detected', async () => {
    const frameworks = await getFrameworks('empty')
    expect(frameworks).toHaveLength(0)
  })

  test('Should return several items when multiple frameworks are detected', async () => {
    const frameworks = await getFrameworks('multiple')
    expect(frameworks).toHaveLength(2)
  })

  test('Should return the version of each framework when multiple are detected', async () => {
    const frameworks = await getFrameworks('multiple')
    expect(frameworks).toMatchSnapshot()
  })

  test('Should return the version of a framework that is not detected by npm package', async () => {
    const frameworks = await getFrameworks('no_package')
    expect(frameworks).toMatchSnapshot()
  })

  test('Should return the version of the framework when the installed package is hoisted to the root project directory', async () => {
    const frameworks = await getFrameworks('monorepos/app1')
    expect(frameworks).toMatchSnapshot()
  })

  test('Should work if version cannot be detected', async () => {
    const frameworks = await getFrameworks('no-version')
    expect(frameworks).toMatchSnapshot()
  })
})

describe('getFramework', () => {
  test('Should allow getting a specific framework', async () => {
    const framework = await getFramework('simple', 'sapper')
    expect(framework).toMatchSnapshot()
  })

  test('Should throw when passing an invalid framework', async () => {
    await expect(getFramework('simple', 'doesNotExist')).rejects.toThrowError()
  })
})

describe('hasFramework', () => {
  test('Should allow testing a specific framework', async () => {
    expect(await hasFramework('simple', 'sapper')).toBe(true)
    expect(await hasFramework('simple', 'nuxt')).toBe(false)
  })

  test('Should throw when testing an invalid framework', async () => {
    await expect(hasFramework('simple', 'doesNotExist')).rejects.toThrowError()
  })

  test('Should sort framework ids in invalid framework error message', async () => {
    try {
      await hasFramework('simple', 'doesNotExist')
      expect.fail('should throw')
    } catch (error) {
      const [, frameworksFromMessage] = error.message.match(/It should be one of: (.+)/)
      const frameworksArray = frameworksFromMessage.split(', ')

      expect(frameworksArray).toEqual([...frameworksArray].sort())
    }
  })
})

test('minFrameworkVersion', async () => {
  expect((await getFramework('min_framework_version', 'angular')).plugins).toEqual(['@netlify/angular-runtime'])
  expect((await getFramework('min_framework_version_2', 'angular')).plugins).toEqual([])
})
