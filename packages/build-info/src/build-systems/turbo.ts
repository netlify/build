import { BaseBuildTool } from './build-system.js'

export class Turbo extends BaseBuildTool {
  id = 'turbo'
  name = 'TurboRepo'
  configFiles = ['turbo.json']
}
