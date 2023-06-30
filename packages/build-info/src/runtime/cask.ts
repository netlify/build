import { LangRuntime } from './runtime.js'

export class Emacs extends LangRuntime {
  id = 'emacs'
  name = 'Emacs'
  configFiles = ['Cask']
}
