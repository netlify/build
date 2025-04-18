import { readFile } from 'fs/promises'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

import Ajv, { ErrorObject } from 'ajv'
import glob from 'fast-glob'
import toml from 'toml'
import { describe, expect, test } from 'vitest'

const ajv = new Ajv({ keywords: ['x-taplo'], allErrors: true })
const currentDir = dirname(fileURLToPath(import.meta.url))
const schemaPath = join(currentDir, '../src/schema/netlify-toml.schema.json')
const schema = JSON.parse(await readFile(schemaPath, 'utf-8'))
const validate = ajv.compile(schema)

const fixtures = await glob('fixtures/*/test.toml', { absolute: true, cwd: currentDir })

const sortErrors = (a: ErrorObject, b: ErrorObject): number => {
  if (a.instancePath === b.instancePath) return 0

  return a.instancePath < b.instancePath ? -1 : 1
}

describe('JSON config schema', () => {
  fixtures.forEach((fixturePath) => {
    const fixture = dirname(fixturePath)
    test(basename(fixture), async () => {
      const tomlConfig = toml.parse(await readFile(join(fixture, 'test.toml'), 'utf-8'))
      const snapshot = join(fixture, 'snapshot.snap')

      expect({ valid: validate(tomlConfig), errors: validate.errors?.sort(sortErrors) }).toMatchFileSnapshot(snapshot)
    })
  })
})
