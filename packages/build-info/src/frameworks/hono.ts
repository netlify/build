import { BaseFramework, Category, Framework } from './framework.js'

export class Hono extends BaseFramework implements Framework {
  readonly id = 'hono'
  name = 'Hono'
  npmDependencies = ['hono']
  category = Category.BackendFramework

  logo = {
    default: '/logos/hono/default.svg',
    light: '/logos/hono/default.svg',
    dark: '/logos/hono/default.svg',
  }
}
