export const onPreBuild = function ({ utils: { cache } }) {
  console.log(Object.keys(cache).sort().join(' '))
}
