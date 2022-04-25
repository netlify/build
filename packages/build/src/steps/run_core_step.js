import { coreStep } from '../plugins_core/edge_functions/index.js'

const runCoreStep = async (bundleType, options) => {
  try {
    if (bundleType === 'edgeFunctionsBundling') {
      return await coreStep(options)
    }
  } catch (error) {
    console.error(error)
  }
}

export default runCoreStep
