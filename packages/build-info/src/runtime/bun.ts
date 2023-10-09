import { LangRuntime } from './runtime.js'

export class Bun extends LangRuntime {
  id = 'bun'
  name = 'Bun'
  configFiles = ['bun.lockb', 'bunfig.toml']
}
