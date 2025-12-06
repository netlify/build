import { BaseFramework, Category, Framework } from './framework.js'

export class Vite extends BaseFramework implements Framework {
  readonly id = 'vite'
  name = 'Vite'
  npmDependencies = ['vite']
  excludedNpmDependencies = [
    '@remix-run/react',
    '@remix-run/dev',
    '@remix-run/server-runtime',
    '@shopify/hydrogen',
    '@builder.io/qwik',
    // Used this name up to 0.3.11
    'solid-start',
    // Renamed starting at 0.4.0
    '@solidjs/start',
    'solid-js',
    '@tanstack/react-router',
    '@tanstack/start',
    '@sveltejs/kit',
    '@analogjs/platform',
    '@react-router/dev',
    'vike',
  ]
  category = Category.BuildTool

  dev = {
    command: 'vite',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vite build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/vite/default.svg',
    light: '/logos/vite/default.svg',
    dark: '/logos/vite/default.svg',
  }
}
