import { LangRuntime } from './runtime.js'

export class Go extends LangRuntime {
  id = 'go'
  name = 'Go'
  configFiles = ['go.mod', '.go-version', 'go.work']
}
