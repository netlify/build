import { BaseBuildTool } from './build-system.js'

export class Rush extends BaseBuildTool {
  id = 'rush'
  name = 'Rush'
  configFiles = ['rush.json']
  logo = {
    default: '/logos/rush/light.svg',
    light: '/logos/rush/light.svg',
    dark: '/logos/rush/dark.svg',
  }
}
