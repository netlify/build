import { LangRuntime } from './runtime.js'

export class Php extends LangRuntime {
  id = 'php'
  name = 'Php'
  configFiles = ['composer.json']
}
