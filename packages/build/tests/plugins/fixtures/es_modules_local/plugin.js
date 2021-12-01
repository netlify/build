export const onPreBuild = function () {
  console.log(typeof import.meta.url === 'string')
}
