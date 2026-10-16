import { writeFile } from 'fs/promises'
import { join } from 'path'

import { dir as getTmpDir } from 'tmp-promise'
import { describe, expect, test } from 'vitest'

import { FunctionWithoutConfig, getConfigForFunction } from '../../src/config.js'

const setupFunctionWithConfigFile = async (config: Record<string, unknown>) => {
  const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
  const mainFile = join(tmpDir, 'my-function.js')

  await writeFile(mainFile, 'export const handler = () => {}')
  await writeFile(join(tmpDir, 'my-function.json'), JSON.stringify({ config, version: 1 }))

  return { func: { mainFile, name: 'my-function' } as FunctionWithoutConfig, tmpDir }
}

describe('getConfigForFunction', () => {
  test('vcpu from a function config file replaces memory from the main config', async () => {
    const { func, tmpDir } = await setupFunctionWithConfigFile({ vcpu: 1 })

    const config = await getConfigForFunction({
      config: { '*': { memory: 2048, region: 'fra' } },
      configFileDirectories: [tmpDir],
      func,
    })

    expect(config).toEqual({ region: 'fra', vcpu: 1 })
  })

  test('memory from the main config is kept when the function config file does not size the function', async () => {
    const { func, tmpDir } = await setupFunctionWithConfigFile({ name: 'My Function' })

    const config = await getConfigForFunction({
      config: { '*': { memory: 2048 } },
      configFileDirectories: [tmpDir],
      func,
    })

    expect(config).toEqual({ memory: 2048, name: 'My Function' })
  })
})
