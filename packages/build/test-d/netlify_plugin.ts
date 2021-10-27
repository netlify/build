import { NetlifyPlugin } from '@netlify/build'
import { expectAssignable, expectType } from 'tsd'

export type onPreBuild = NetlifyPlugin['onPreBuild']

const testEventNames = function () {
  expectAssignable<NetlifyPlugin['onPreBuild']>(noop)
  expectAssignable<NetlifyPlugin['onBuild']>(noop)
  expectAssignable<NetlifyPlugin['onPostBuild']>(noop)
  expectAssignable<NetlifyPlugin['onError']>(noop)
  expectAssignable<NetlifyPlugin['onSuccess']>(noop)
  expectAssignable<NetlifyPlugin['onEnd']>(noop)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function () {}

const testOnError: NetlifyPlugin['onError'] = function ({ error }) {
  expectType<Error>(error)
}

const testOnEnd: NetlifyPlugin['onEnd'] = function ({ error }) {
  expectType<Error | undefined>(error)
}
