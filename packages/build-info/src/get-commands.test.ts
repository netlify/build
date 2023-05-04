import { test, expect } from 'vitest'

import { getBuildCommands, getDevCommands } from './get-commands.js'

test('should return no dev commands if no scripts are specified', () => {
  expect(getDevCommands('astro dev')).toHaveLength(0)
})

test('should return no build commands if no scripts are specified', () => {
  expect(getDevCommands('astro build')).toHaveLength(0)
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

test('should return the build commands that match the framework command', () => {
  expect(
    getBuildCommands('astro build', {
      dev: 'astro dev',
      start: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      astro: 'astro',
    }),
  ).toEqual(['build'])
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

test('should return the build commands that match the framework command even for nested scripts', () => {
  expect(
    getBuildCommands('astro build', {
      'docs:dev': 'astro dev',
      'docs:start': 'astro dev',
      'docs:build': 'astro build',
      'docs:preview': 'astro preview',
    }),
  ).toEqual(['docs:build'])
})

test('should return the dev commands if no framework command matches', () => {
  expect(
    getDevCommands('next dev', {
      dev: 'astro dev',
      start: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
    }),
  ).toEqual(['dev', 'start'])
})

test('should return the build commands if no framework command matches', () => {
  expect(
    getBuildCommands('next build', {
      dev: 'astro dev',
      start: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
    }),
  ).toEqual(['build'])
})
