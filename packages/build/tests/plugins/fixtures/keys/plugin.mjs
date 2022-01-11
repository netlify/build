export const onPreBuild = function ({ utils }) {
  console.log(Object.keys(utils).sort().join(' '))
}
