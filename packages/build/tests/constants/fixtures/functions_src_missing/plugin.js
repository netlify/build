import { existsSync } from 'fs'

export const onPreBuild = async function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC, existsSync(FUNCTIONS_SRC))
}
