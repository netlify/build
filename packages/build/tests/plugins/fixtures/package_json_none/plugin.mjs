export const onPreBuild = function ({ packageJson: { name } }) {
  console.log(name === undefined)
}
