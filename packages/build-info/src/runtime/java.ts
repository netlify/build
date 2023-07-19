import { LangRuntime } from './runtime.js'

export class Java extends LangRuntime {
  id = 'java'
  name = 'Java'
  configFiles = ['project.clj', 'build.boot']
}
