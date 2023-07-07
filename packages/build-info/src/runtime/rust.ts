import { LangRuntime } from './runtime.js'

export class Rust extends LangRuntime {
  id = 'rust'
  name = 'Rust'
  configFiles = ['Cargo.toml', 'Cargo.lock']
}
