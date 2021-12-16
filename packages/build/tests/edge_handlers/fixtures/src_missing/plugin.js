import pathExists from 'path-exists'

export default {
  async onPreBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC, await pathExists(EDGE_HANDLERS_SRC))
  },
}
