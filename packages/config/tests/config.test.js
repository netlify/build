const test = require('ava')

const netlifyConfig = require('..')

const FIXTURES_DIR = `${__dirname}/fixtures`

test('Test TOML', async t => {
  const config = await netlifyConfig(`${FIXTURES_DIR}/netlify.toml`)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      lifecycle: {
        build: ['npm run build']
      },
      functions: 'functions'
    }
  })
})

test('Test YAML', async t => {
  const config = await netlifyConfig(`${FIXTURES_DIR}/netlify.yml`)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      lifecycle: {
        build: ['npm run build']
      },
      functions: 'functions'
    }
  })
})

test('Test JSON', async t => {
  const config = await netlifyConfig(`${FIXTURES_DIR}/netlify.json`)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      lifecycle: {
        build: ['npm run build']
      },
      functions: 'functions'
    }
  })
})
