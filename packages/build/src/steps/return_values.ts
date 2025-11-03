type GeneratorType = 'build plugin' | 'extension'

export interface GeneratedFunction {
  generator: {
    displayName: string
    name: string
    type: GeneratorType
  }
  path: string
}

export interface ReturnValue {
  displayName?: string
  generatedFunctions?: { path: string }[]
  generatorType: GeneratorType
}

export const getGeneratedFunctions = (returnValues?: Record<string, ReturnValue>): GeneratedFunction[] => {
  return Object.entries(returnValues ?? {}).flatMap(([name, returnValue]) => {
    const generator = {
      displayName: returnValue.displayName ?? name,
      name,
      type: returnValue.generatorType,
    }

    return (
      returnValue.generatedFunctions?.map((func) => ({
        generator,
        path: func.path,
      })) ?? []
    )
  })
}
