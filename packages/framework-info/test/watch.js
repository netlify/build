const test = require('ava')

const { getFrameworks } = require('./helpers/main.js')

test('Should use package scripts as watch command', async (t) => {
  const frameworks = await getFrameworks('use_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].watch.commands, ['npm run start', 'npm run dev'])
})

test('Should allow package scripts names with colons', async (t) => {
  const frameworks = await getFrameworks('colon_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].watch.commands, ['npm run docs:dev'])
})

test('Should only use package scripts if it includes framework.watch.command', async (t) => {
  const frameworks = await getFrameworks('watch_command_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].watch.commands, ['npm run another'])
})

test('Should default watch.commands to framework.watch.command', async (t) => {
  const frameworks = await getFrameworks('empty_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].watch.commands, ['sapper dev'])
})
