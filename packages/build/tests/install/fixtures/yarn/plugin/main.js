import avg from 'math-avg'

export const onPreBuild = function () {
  console.log(avg([1, 2]))
}
