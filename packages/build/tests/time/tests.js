const { readFile } = require('fs')
const { promisify } = require('util')

const test = require('ava')
const del = require('del')

const { runFixture } = require('../helpers/main')
const { getTempName } = require('../helpers/temp')

const pReadFile = promisify(readFile)

test('Prints timings to --timersFile', async t => {
  const timersFile = await getTempName()
  try {
    await runFixture(t, 'simple', { flags: { timersFile }, snapshot: false })

    const timerLines = await getTimerLines(timersFile)

    timerLines.forEach(({ tag, durationMs }) => {
      t.true(isDefinedString(tag))
      t.true(isDefinedString(durationMs))
      t.true(DURATION_REGEXP.test(durationMs))
    })
  } finally {
    await del(timersFile, { force: true })
  }
})

const isDefinedString = function(string) {
  return typeof string === 'string' && string.trim() !== ''
}

const DURATION_REGEXP = /\d+ms/

test('Prints all timings', async t => {
  const timersFile = await getTempName()
  try {
    await runFixture(t, 'plugin', { flags: { timersFile }, snapshot: false })

    const timerLines = await getTimerLines(timersFile)
    TIMINGS.forEach(tag => {
      t.true(timerLines.some(timerLine => timerLine.tag === tag))
    })
  } finally {
    await del(timersFile, { force: true })
  }
})

const TIMINGS = [
  'run_netlify_build.resolve_config',
  'run_netlify_build.get_plugins_options',
  'run_netlify_build.start_plugins',
  'run_netlify_build.load_plugins',
  'run_netlify_build.command',
  'run_netlify_build.total',
  'plugin.onBuild',
]

const getTimerLines = async function(timersFile) {
  const timersFileContent = await pReadFile(timersFile, 'utf8')
  return timersFileContent
    .trim()
    .split('\n')
    .map(parseTimerLine)
}

const parseTimerLine = function(timerLine) {
  const [tag, durationMs] = timerLine.split(' ')
  return { tag, durationMs }
}
