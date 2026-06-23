export const onPreBuild = function () {
  console.log(JSON.stringify(process.env))
}
