const { execPath } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')
const { copyToTemp } = require('../../helpers/temp')
const { removeDir } = require('../../helpers/dir')

test('--node-version success', async t => {
  const { tempDir, tempFile } = await copyToTemp(execPath)
  try {
    await runFixture(t, 'node_version', { flags: `--node-path=${tempFile}`, env: { TEST_NODE_PATH: tempFile } })
  } finally {
    await removeDir(tempDir)
  }
})
