import pathExists from 'path-exists'

export const onPreBuild = async function ({ constants: { EDGE_HANDLERS_SRC } }) {
  console.log(EDGE_HANDLERS_SRC, await pathExists(EDGE_HANDLERS_SRC))
}
