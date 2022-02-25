import { OnPreBuild } from '@netlify/build'

export const onPreBuild: OnPreBuild = function ({ constants }) {
  console.log(constants.DOES_NOT_EXIST)
}
