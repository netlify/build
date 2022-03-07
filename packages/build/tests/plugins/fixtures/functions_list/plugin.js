export const onPreBuild = async function ({
  utils: {
    functions: { list },
  },
}) {
  const functions = await list()

  console.log(JSON.stringify(functions, null, 2))
}
