import { LangRuntime } from './runtime.js'

export class Dotnet extends LangRuntime {
  id = 'dotnet'
  name = 'Dotnet'
  configFiles = ['Program.cs', 'appsettings.json']
}
