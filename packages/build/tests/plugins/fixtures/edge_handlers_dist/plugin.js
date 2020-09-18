module.exports = {
  onPreBuild({ constants: { EDGE_HANDLERS_DIST } }) {
    console.log(EDGE_HANDLERS_DIST)
  },
}
