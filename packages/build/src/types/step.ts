interface GeneratedFunction {
  path: string
}

export interface ReturnValue {
  displayName: string
  generatedFunctions?: GeneratedFunction[]
  generatorType: 'build plugin' | 'extension'
}
