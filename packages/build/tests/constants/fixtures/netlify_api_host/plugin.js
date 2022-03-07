export const onPreBuild = function ({ constants: { NETLIFY_API_HOST } }) {
  console.log(NETLIFY_API_HOST)
}
