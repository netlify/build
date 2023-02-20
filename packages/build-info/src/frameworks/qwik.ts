import { BaseFramework, Category, Framework } from './framework.js'

export class Qwik extends BaseFramework implements Framework {
  id = 'qwik'
  name = 'Qwik'
  npmDependencies = ['@builder.io/qwik']
  category = Category.SSG

  dev = {
    command: 'vite',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  get build() {
    const runCmd = this.project.packageManager?.runCommand || 'npm run'
    return {
      command: `${runCmd} build`,
      directory: 'dist',
    }
  }

  logo = {
    default: '/logos/qwik/default.svg',
    light: '/logos/qwik/default.svg',
    dark: '/logos/qwik/default.svg',
  }
}
