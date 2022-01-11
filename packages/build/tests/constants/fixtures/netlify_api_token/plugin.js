export const onPreBuild = function ({ constants: { NETLIFY_API_TOKEN = 'none' } }) {
  console.log(NETLIFY_API_TOKEN)
}
