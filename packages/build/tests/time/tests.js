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

    timerLines.forEach(({ stageTag, durationMs }) => {
      t.true(isDefinedString(stageTag))
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
    TIMINGS.forEach(stageTag => {
      t.true(timerLines.some(timerLine => timerLine.stageTag === stageTag))
    })
  } finally {
    await del(timersFile, { force: true })
  }
})

const TIMINGS = [
  'resolve_config',
  'get_plugins_options',
  'start_plugins',
  'load_plugins',
  'run_plugins',
  'build_command',
  'others',
  'one',
  'two',
  'onBuild',
  'onPostBuild',
]

const getTimerLines = async function(timersFile) {
  const timersFileContent = await pReadFile(timersFile, 'utf8')
  return timersFileContent
    .trim()
    .split('\n')
    .map(parseTimerLine)
}

const parseTimerLine = function(timerLine) {
  const [stageTag, durationMs] = timerLine.split(' ')
  return { stageTag, durationMs }
}
