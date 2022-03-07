export const onPreBuild = function ({ netlifyConfig: { plugins } }) {
  console.log(Array.isArray(plugins))
}
