import { BaseBuildTool } from './build-system.js'

export class Rush extends BaseBuildTool {
  id = 'rush'
  name = 'Rush'
  configFiles = ['rush.json']
}
