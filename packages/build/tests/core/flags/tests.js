const { execPath } = require('process')

const test = require('ava')
const del = require('del')

const { runFixture, copyToTemp } = require('../../helpers/main')

test('--node-version success', async t => {
  const { tempDir, tempFile } = await copyToTemp(execPath)
  try {
    await runFixture(t, 'node_version', { flags: `--node-path=${tempFile}`, env: { TEST_NODE_PATH: tempFile } })
  } finally {
    del(tempDir)
  }
})
