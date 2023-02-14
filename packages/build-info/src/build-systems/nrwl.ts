import { BaseBuildTool } from './build-system.js'

export class Nx extends BaseBuildTool {
  id = 'nx'
  name = 'Nx'
  configFiles = ['nx.json']
}

export class Lerna extends BaseBuildTool {
  id = 'lerna'
  name = 'Lerna'
  configFiles = ['lerna.json']
}
