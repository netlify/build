import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test("secrets scanning, don't run when secrets are provided/default", async (t) => {
  const output = await new Fixture('./fixtures/src_default').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test("secrets scanning, don't run when there are no secrets", async (t) => {
  const output = await new Fixture('./fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: '' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip with secrets but SECRETS_SCAN_ENABLED=false', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_disabled')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when secrets passed but no env vars set', async (t) => {
  const output = await new Fixture('./fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: 'abc,DEF' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when secrets passed but no non-empty/trivial env vars set', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_env_vars_set_empty')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_,2ENV_VAR_3,ENV_VAR_4,ENV_VAR_5' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_KEYS omits all of them', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_all_keys')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_all_paths')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits globbed files', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_glob_path')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should fail build when it finds secrets in the src and build output', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning failure should produce an user error', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
    })
    .runBuildProgrammatic()
  // Severity code of 2 is user error
  t.is(severityCode, 2)
})

test('secrets scanning, should not fail if the secrets values are not detected in the build output', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_env_vars_no_matches')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(output.includes(`No secrets detected in build output or repo code!`))
})

test.only('secrets scanning should not scan .cache/ directory', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_cache_path')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(output.includes(`No secrets detected in build output or repo code!`))
})
