import { NetlifyPlugin, OnPreBuild, OnBuild, OnPostBuild, OnError, OnSuccess, OnEnd } from '@netlify/build'
import { expectAssignable, expectType } from 'tsd'

const testEventNames = function () {
  expectAssignable<NetlifyPlugin['onPreBuild']>(noop)
  expectAssignable<OnPreBuild>(noop)
  expectAssignable<OnBuild>(noop)
  expectAssignable<OnPostBuild>(noop)
  expectAssignable<OnError>(noop)
  expectAssignable<OnSuccess>(noop)
  expectAssignable<OnEnd>(noop)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function () {}

const testOnError: OnError = function ({ error }) {
  expectType<Error>(error)
}

const testOnEnd: OnEnd = function ({ error }) {
  expectType<Error | undefined>(error)
}
