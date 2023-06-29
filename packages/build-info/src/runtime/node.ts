import { BaseRuntime } from './runtime.js'

export class Node extends BaseRuntime {
  id = 'node'
  name = 'NodeJS'
  version = process.env['NODE_VERSION']
  configFiles = ['.node-version', '.nvmrc', 'package.json']
}
