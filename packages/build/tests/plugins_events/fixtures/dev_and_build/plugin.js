export const onPreDev = function ({ constants, netlifyConfig }) {
  console.log('onPreDev:', constants)
  netlifyConfig.build.environment.TEST_ASSIGN = 'true';
}

export const onDev = function ({ constants }) {
  console.log('onDev:', constants)
}

export const onPreBuild = function ({ constants }) {
  console.log('onPreBuild:', constants)
}

export const onBuild = function ({ constants }) {
  console.log('onBuild:', constants)
}

export const onPostBuild = function ({ constants }) {
  console.log('onPostBuild:', constants)
}

export const onSuccess = function ({ constants }) {
  console.log('onSuccess:', constants)
}

export const onError = function ({ constants }) {
  console.log('onError:', constants)
}

export const onEnd = function ({ constants }) {
  console.log('onEnd:', constants)
}
