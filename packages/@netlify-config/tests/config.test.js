import path from 'path'
import test from 'ava'
import netlifyConfig from '../index'

test('Test TOML', async t => {
  const filePath = path.resolve(__dirname, 'fixtures/netlify.toml')
  const config = await netlifyConfig(filePath)
  console.log('config', config)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      command: 'npm run build',
      functions: 'functions'
    }
  })
})

test('Test YAML', async t => {
  const filePath = path.resolve(__dirname, 'fixtures/netlify.yml')
  const config = await netlifyConfig(filePath)

  t.deepEqual(config, {
    build: {
      publish: 'dist',
      command: 'npm run build',
      functions: 'functions'
    }
  })
})

test('Test JSON', async t => {
  const filePath = path.resolve(__dirname, 'fixtures/netlify.json')
  const config = await netlifyConfig(filePath)
  t.deepEqual(config, {
    build: {
      publish: 'dist',
      command: 'npm run build',
      functions: 'functions'
    }
  })
})
