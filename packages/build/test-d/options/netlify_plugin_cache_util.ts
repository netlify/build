import type { OnPreBuild, NetlifyPluginUtils } from '@netlify/build'
import { expectType } from 'tsd'

export const testUtilsCacheSave: OnPreBuild = function ({
  utils: {
    cache: { save },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<boolean>>(save('file'))
  save(['file'])
  save('file', {})
  save('file', { ttl: 1, digests: ['digest'], cwd: '.' })
}

export const testUtilsCacheList: OnPreBuild = function ({
  utils: {
    cache: { list },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<string[]>>(list({}))
  list()
  list({})
  list({ depth: 1, cwd: '.' })
}

export const testUtilsRestore: OnPreBuild = function ({
  utils: {
    cache: { restore },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<boolean>>(restore('file'))
  restore(['file'])
  restore('file', {})
  restore('file', { cwd: '.' })
}

export const testUtilsCacheRemove: OnPreBuild = function ({
  utils: {
    cache: { remove },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<boolean>>(remove('file'))
  remove(['file'])
  remove('file', {})
  remove('file', { cwd: '.' })
}

export const testUtilsCacheHas: OnPreBuild = function ({
  utils: {
    cache: { has },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<boolean>>(has('file'))
  has(['file'])
  has('file', {})
  has('file', { cwd: '.' })
}
