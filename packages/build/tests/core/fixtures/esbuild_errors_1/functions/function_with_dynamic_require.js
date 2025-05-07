const moduleName = 'test'
const returnValue = await import(moduleName)

export const handler = () => returnValue
