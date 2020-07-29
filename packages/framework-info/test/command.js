const test = require('ava')

const { getFrameworks } = require('./helpers/main.js')

test('Should use package scripts as build command', async t => {
  const frameworks = await getFrameworks('use_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].command, ['npm run start', 'npm run dev'])
})

test('Should use package scripts if it includes framework.command', async t => {
  const frameworks = await getFrameworks('command_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].command, ['npm run another', 'npm run start', 'npm run dev'])
})

test('Should default command to framework.command', async t => {
  const frameworks = await getFrameworks('empty_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].command, ['sapper dev'])
})

test('Should ignore package scripts with ignoredCommand option', async t => {
  const frameworks = await getFrameworks('use_scripts', { ignoredCommand: 'testTwo' })
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].command, ['npm run dev'])
})
