import { OnPreBuild } from '@netlify-labs/build-internal'

export const onPreBuild: OnPreBuild = function ({ constants }) {
  console.log(constants.DOES_NOT_EXIST)
}
