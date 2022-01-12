export const onPreBuild = function ({ constants: { NETLIFY_BUILD_VERSION } }) {
  console.log(NETLIFY_BUILD_VERSION)
}
