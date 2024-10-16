import { LangRuntime } from './runtime.js'

export class Erlang extends LangRuntime {
  id = 'erlang'
  name = 'Erlang'
  configFiles = ['rebar.config', 'rebar.lock']
}
