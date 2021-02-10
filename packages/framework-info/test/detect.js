const { version: nodeVersion } = require('process')

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

if (nodeVersion !== 'v8.3.0') {
  test('Should detect Next.js plugin for Next.js if when Node version >= 10.13.0', async (t) => {
    const frameworks = await getFrameworks('next-plugin')
    t.is(frameworks[0].id, 'next')
    t.deepEqual(frameworks[0].plugins, ['@netlify/plugin-nextjs'])
  })
}

if (nodeVersion === 'v8.3.0') {
  test('Should not detect Next.js plugin for Next.js if when Node version < 10.13.0', async (t) => {
    const frameworks = await getFrameworks('next-plugin')
    t.is(frameworks[0].id, 'next')
    t.is(frameworks[0].plugins.length, 0)
  })
}
