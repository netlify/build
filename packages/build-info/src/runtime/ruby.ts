import { LangRuntime } from './runtime.js'

export class Ruby extends LangRuntime {
  id = 'ruby'
  name = 'Ruby'
  configFiles = ['.ruby-version', 'Gemfile.lock', 'Gemfile']
}
