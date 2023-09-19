import { buildSite } from './core/main.js'

// export the legacy types
export type * from '../types/index.js'

// actual main types
export { startDev } from './core/dev.js'
export { runCoreSteps } from './steps/run_core_steps.js'

// default export the buildSite function
export default buildSite
