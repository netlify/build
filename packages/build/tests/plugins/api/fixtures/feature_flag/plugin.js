module.exports = {
  async onPreBuild({ api }) {
    console.log(api === undefined)
  },
}
