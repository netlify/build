import { pathExists } from 'path-exists'

export const onPreBuild = async function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC, await pathExists(FUNCTIONS_SRC))
}
