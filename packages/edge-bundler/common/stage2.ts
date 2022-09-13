export interface InputFunction {
  name: string
  path: string
}

export interface WriteStage2Options {
  basePath: string
  destPath: string
  functions: InputFunction[]
  importMapURL?: string
}
