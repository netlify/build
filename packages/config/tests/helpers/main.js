// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
import { runFixtureConfig } from '../../../build/tests/helpers/config.js'

export { FIXTURES_DIR, startServer } from '../../../build/tests/helpers/common.js'

export const getFixtureConfig = async function (t, fixtureName, opts) {
  const { returnValue } = await runFixtureConfig(t, fixtureName, { snapshot: false, ...opts })
  try {
    return JSON.parse(returnValue)
  } catch {
    return returnValue
  }
}

export const runFixture = async function (...args) {
  return await runFixtureConfig(...args)
}
