export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.directory = 'test_functions'
}

export const onBuild = async function ({
  utils: {
    functions: { list },
  },
}) {
  const functions = await list()
  const names = functions.map(({ name }) => name).join(' ')
  console.log(names)
}
