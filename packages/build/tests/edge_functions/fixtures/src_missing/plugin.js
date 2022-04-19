import { pathExists } from 'path-exists'

export const onPreBuild = async function ({ constants: { EDGE_FUNCTIONS_SRC } }) {
  console.log(EDGE_FUNCTIONS_SRC, await pathExists(EDGE_FUNCTIONS_SRC))
}
