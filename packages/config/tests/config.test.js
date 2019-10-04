const test = require('ava')

const resolveConfig = require('..')

const FIXTURES_DIR = `${__dirname}/fixtures`

test('Test TOML', async t => {
  const config = await resolveConfig(`${FIXTURES_DIR}/netlify.toml`)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      lifecycle: {
        build: ['npm run build']
      },
      functions: 'functions'
    },
    plugins: {}
  })
})

test('Test YAML', async t => {
  const config = await resolveConfig(`${FIXTURES_DIR}/netlify.yml`)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      lifecycle: {
        build: ['npm run build']
      },
      functions: 'functions'
    },
    plugins: {}
  })
})

test('Test JSON', async t => {
  const config = await resolveConfig(`${FIXTURES_DIR}/netlify.json`)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      lifecycle: {
        build: ['npm run build']
      },
      functions: 'functions'
    },
    plugins: {}
  })
})
