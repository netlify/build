import pathExists from 'path-exists'

export default {
  async onPreBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC, await pathExists(FUNCTIONS_SRC))
  },
}
