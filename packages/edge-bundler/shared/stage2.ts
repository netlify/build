export interface InputFunction {
  name: string
  path: string
}

export interface WriteStage2Options {
  basePath: string
  destPath: string
  externals: string[]
  functions: InputFunction[]
  importMapData?: string
  vendorDirectory?: string
}
