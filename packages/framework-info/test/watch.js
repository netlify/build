const test = require('ava')

const { getFrameworks } = require('./helpers/main.js')

test('Should use package scripts as watch command', async (t) => {
  const frameworks = await getFrameworks('use_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].watch.commands, ['npm run dev', 'npm run start'])
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

test('Should return the same result when script order is different', async (t) => {
  const frameworksBuildFirst = await getFrameworks('scripts-order/build-first')
  const frameworksDevFirst = await getFrameworks('scripts-order/dev-first')

  t.is(frameworksBuildFirst.length, 1)
  t.is(frameworksDevFirst.length, 1)

  t.deepEqual(frameworksBuildFirst[0].watch.commands, ['npm run dev', 'npm run start', 'npm run build'])
  t.deepEqual(frameworksBuildFirst, frameworksDevFirst)
})

test('Should sort scripts in the format *:<name>', async (t) => {
  const frameworks = await getFrameworks('scripts-order/postfix-format')

  t.is(frameworks.length, 1)

  t.deepEqual(frameworks[0].watch.commands, ['npm run site:dev', 'npm run site:start', 'npm run site:build'])
})
