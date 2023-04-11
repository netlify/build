import { BaseFramework, Category, Framework } from './framework.js'

export class CreateReactApp extends BaseFramework implements Framework {
  readonly id = 'create-react-app'
  name = 'Create React App'
  npmDependencies = ['react-scripts']
  category = Category.FrontendFramework
  staticAssetsDirectory = 'public'

  dev = {
    command: 'react-scripts start',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'react-scripts build',
    directory: 'build',
  }

  logo = {
    default: '/logos/create-react-app/default.svg',
    light: '/logos/create-react-app/default.svg',
    dark: '/logos/create-react-app/default.svg',
  }

  env = { BROWSER: 'none', PORT: '3000' }
}
