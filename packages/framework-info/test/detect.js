const test = require('ava')

const { getFrameworks } = require('./helpers/main.js')

test('Should detect dependencies', async (t) => {
  const frameworks = await getFrameworks('dependencies')
  t.is(frameworks.length, 1)
})

test('Should detect devDependencies', async (t) => {
  const frameworks = await getFrameworks('dev_dependencies')
  t.is(frameworks.length, 1)
})

test('Should ignore empty framework.npmDependencies', async (t) => {
  const frameworks = await getFrameworks('empty_dependencies')
  t.is(frameworks.length, 1)
})

test('Should detect any of several framework.npmDependencies', async (t) => {
  const frameworks = await getFrameworks('several_dependencies')
  t.is(frameworks.length, 1)
})

test('Should ignore if matching any framework.excludedNpmDependencies', async (t) => {
  const frameworks = await getFrameworks('excluded_dependencies')
  t.is(frameworks.length, 1)
})

test('Should detect config files', async (t) => {
  const frameworks = await getFrameworks('config_files')
  t.is(frameworks.length, 1)
})
