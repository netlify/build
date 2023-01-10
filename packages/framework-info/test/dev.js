import test from 'ava'

import { getFrameworks } from './helpers/main.js'

test('Should use package scripts as dev command', async (t) => {
  const frameworks = await getFrameworks('use_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].dev.commands, ['npm run dev', 'npm run start'])
})

test('Should allow package scripts names with colons', async (t) => {
  const frameworks = await getFrameworks('colon_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].dev.commands, ['npm run docs:dev'])
})

test('Should only use package scripts if it includes framework.dev.command', async (t) => {
  const frameworks = await getFrameworks('dev_command_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].dev.commands, ['npm run another'])
})

test('Should default dev.commands to framework.dev.command', async (t) => {
  const frameworks = await getFrameworks('empty_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].dev.commands, ['sapper dev'])
})

test('Should sort scripts in the format *:<name>', async (t) => {
  const frameworks = await getFrameworks('scripts-order/postfix-format')

  t.is(frameworks.length, 1)

  t.deepEqual(frameworks[0].dev.commands, ['npm run site:dev', 'npm run site:start', 'npm run site:build'])
})

test('Should sort scripts when dev command is a substring of build command', async (t) => {
  const frameworks = await getFrameworks('scripts-order/command-substring')

  t.is(frameworks.length, 1)

  t.deepEqual(frameworks[0].dev.commands, ['npm run dev', 'npm run build'])
})

test('Should prioritize dev over serve', async (t) => {
  const frameworks = await getFrameworks('scripts-order/vite-framework')

  t.is(frameworks.length, 1)

  t.deepEqual(frameworks[0].dev.commands, ['npm run dev', 'npm run serve', 'npm run build'])
})

test(`Should exclude 'netlify dev' script`, async (t) => {
  const frameworks = await getFrameworks('excluded_script')

  t.is(frameworks.length, 1)

  t.deepEqual(frameworks[0].dev.commands, ['npm run build'])
})
