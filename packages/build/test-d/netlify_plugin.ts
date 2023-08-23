import type { NetlifyPlugin, OnPreBuild, OnBuild, OnPostBuild, OnError, OnSuccess, OnEnd } from '@netlify/build'
import { expectAssignable, expectType } from 'tsd'

export const testEventNames = function () {
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

export const testOnError: OnError = function ({ error }) {
  expectType<Error>(error)
}

export const testOnEnd: OnEnd = function ({ error }) {
  expectType<Error | undefined>(error)
}
