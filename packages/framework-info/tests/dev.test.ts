import { expect, test } from 'vitest'

import { getFrameworks } from './helpers/main.js'

test('Should use package scripts as dev command', async () => {
  const frameworks = await getFrameworks('use_scripts')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run dev', 'npm run start'])
})

test('Should allow package scripts names with colons', async () => {
  const frameworks = await getFrameworks('colon_scripts')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run docs:dev'])
})

test('Should only use package scripts if it includes framework.dev.command', async () => {
  const frameworks = await getFrameworks('dev_command_scripts')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run another'])
})

test('Should default dev.commands to framework.dev.command', async () => {
  const frameworks = await getFrameworks('empty_scripts')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['sapper dev'])
})

test('Should sort scripts in the format *:<name>', async () => {
  const frameworks = await getFrameworks('scripts-order/postfix-format')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run site:dev', 'npm run site:start', 'npm run site:build'])
})

test('Should sort scripts when dev command is a substring of build command', async () => {
  const frameworks = await getFrameworks('scripts-order/command-substring')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run dev', 'npm run build'])
})

test('Should prioritize dev over serve', async () => {
  const frameworks = await getFrameworks('scripts-order/vite-framework')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run dev', 'npm run serve', 'npm run build'])
})

test(`Should exclude 'netlify dev' script`, async () => {
  const frameworks = await getFrameworks('excluded_script')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['npm run build'])
})
