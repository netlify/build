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

    const timerLines = await getTimerLines(t, timersFile)
    t.true(timerLines.every(isTimerLine))
  } finally {
    await del(timersFile, { force: true })
  }
})

const getTimerLines = async function(t, timersFile) {
  const timersFileContent = await pReadFile(timersFile, 'utf8')
  return timersFileContent.trim().split('\n')
}

const isTimerLine = function(timerLine) {
  const [name, durationMs] = timerLine.split(' ')
  return [name, durationMs].every(isDefinedString) && DURATION_REGEXP.test(durationMs)
}

const isDefinedString = function(string) {
  return typeof string === 'string' && string.trim() !== ''
}

const DURATION_REGEXP = /\d+ms/

test('Prints all timings', async t => {
  const timersFile = await getTempName()
  try {
    await runFixture(t, 'plugin', { flags: { timersFile }, snapshot: false })

    const timersFileContent = await pReadFile(timersFile, 'utf8')
    TIMINGS.forEach(timing => {
      t.true(timersFileContent.includes(`${timing} `))
    })
  } finally {
    await del(timersFile, { force: true })
  }
})

const TIMINGS = [
  'buildbot.build.commands.loadPlugins',
  'buildbot.build.commands.plugin.onBuild',
  'buildbot.build.commands',
]
