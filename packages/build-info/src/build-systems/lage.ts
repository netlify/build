import { BaseBuildTool } from './build-system.js'

export class Lage extends BaseBuildTool {
  id = 'lage'
  name = 'Lage'
  configFiles = ['lage.config.js']
}
