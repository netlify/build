import { LangRuntime } from './runtime.js'

export class Python extends LangRuntime {
  id = 'python'
  name = 'Python'
  configFiles = ['requirements.txt', 'Pipfile']
}
