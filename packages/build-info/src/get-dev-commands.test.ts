import { test, expect } from 'vitest'

import { getDevCommands } from './get-dev-commands.js'

test('should return no dev commands if no scripts are specified', () => {
  expect(getDevCommands('astro dev')).toHaveLength(0)
})

test('should return the dev commands that match the framework command', () => {
  expect(
    getDevCommands('astro dev', {
      dev: 'astro dev',
      start: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      astro: 'astro',
    }),
  ).toEqual(['dev', 'start'])
})

test('should return the dev commands that match the framework command even for nested scripts', () => {
  expect(
    getDevCommands('astro dev', {
      'docs:dev': 'astro dev',
      'docs:start': 'astro dev',
      'docs:build': 'astro build',
      'docs:preview': 'astro preview',
    }),
  ).toEqual(['docs:dev', 'docs:start'])
})

test('should return the dev commands if no framework command matches', () => {
  expect(
    getDevCommands('next dev', {
      dev: 'astro dev',
      start: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
    }),
  ).toEqual(['dev', 'start', 'build'])
})
