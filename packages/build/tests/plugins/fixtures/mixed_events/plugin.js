const noop = () => {
  // no-op
}

export const onPreBuild = async function () {
  console.log('Hello from onPreBuild')
}

export const onBuild = async function () {
  await new Promise(resolve => setTimeout(resolve, 1_000))

  noop()
}

export const onPostBuild = async function () {
  console.log('Hello from onPostBuild')
}

export const onEnd = async function () {
  noop()
}
