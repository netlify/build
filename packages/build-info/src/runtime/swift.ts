import { LangRuntime } from './runtime.js'

export class Swift extends LangRuntime {
  id = 'swift'
  name = 'Swift'
  configFiles = ['.swift-version', 'Package.swift']
}
