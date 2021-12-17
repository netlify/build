export default {
  async onPreBuild({
    utils: {
      functions: { list },
    },
  }) {
    const functions = await list()

    console.log(JSON.stringify(functions, null, 2))
  },
}
