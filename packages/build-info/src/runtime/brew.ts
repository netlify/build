import { LangRuntime } from './runtime.js'

export class Brew extends LangRuntime {
  id = 'brew'
  name = 'Brew'
  configFiles = ['Brewfile.netlify']
}
