import { OnPreBuild, NetlifyPluginUtils } from '@netlify/build'
import { expectType } from 'tsd'

const testUtilsCacheSave: OnPreBuild = function ({
  utils: {
    cache: { save, list, restore, remove, has },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<boolean>>(save('file'))
  save(['file'])
  save('file', {})
  save('file', { ttl: 1, digests: ['digest'], cwd: '.' })
}

const testUtilsCacheList: OnPreBuild = function ({
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

const testUtilsRestore: OnPreBuild = function ({
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

const testUtilsCacheRemove: OnPreBuild = function ({
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

const testUtilsCacheHas: OnPreBuild = function ({
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
