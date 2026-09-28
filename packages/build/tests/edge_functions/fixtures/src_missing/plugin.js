import { existsSync } from 'fs'

export const onPreBuild = async function ({ constants: { EDGE_FUNCTIONS_SRC } }) {
  console.log(EDGE_FUNCTIONS_SRC, existsSync(EDGE_FUNCTIONS_SRC))
}
