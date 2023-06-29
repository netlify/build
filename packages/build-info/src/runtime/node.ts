import { LangRuntime } from './runtime.js'

export class Node extends LangRuntime {
  id = 'node'
  name = 'NodeJS'
  configFiles = ['.node-version', '.nvmrc', 'package.json']
}
