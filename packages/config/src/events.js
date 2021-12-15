// List of build plugins events
export const EVENTS = [
  // Before build command
  'onPreBuild',
  // After build command, before Functions bundling
  'onBuild',
  // After Functions bundling
  'onPostBuild',
  // After build success
  'onSuccess',
  // After build error
  'onError',
  // After build error or success
  'onEnd',
]
