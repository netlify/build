import { BaseBuildTool } from './build-system.js'

export class Lerna extends BaseBuildTool {
  id = 'lerna'
  name = 'Lerna'
  configFiles = ['lerna.json']
  logo = {
    default: '/logos/lerna/light.svg',
    light: '/logos/lerna/light.svg',
    dark: '/logos/lerna/dark.svg',
  }
}
