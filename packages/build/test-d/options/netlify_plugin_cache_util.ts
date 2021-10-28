import { expectType } from 'tsd'

import { onPreBuild } from '../netlify_plugin'

const testUtilsCacheSave: onPreBuild = function ({
  utils: {
    cache: { save, list, restore, remove, has },
  },
}) {
  expectType<Promise<boolean>>(save('file'))
  save(['file'])
  save('file', {})
  save('file', { ttl: 1, digests: ['digest'], cwd: '.' })
}

const testUtilsCacheList: onPreBuild = function ({
  utils: {
    cache: { list },
  },
}) {
  expectType<Promise<string[]>>(list({}))
  list()
  list({})
  list({ depth: 1, cwd: '.' })
}

const testUtilsRestore: onPreBuild = function ({
  utils: {
    cache: { restore },
  },
}) {
  expectType<Promise<boolean>>(restore('file'))
  restore(['file'])
  restore('file', {})
  restore('file', { cwd: '.' })
}

const testUtilsCacheRemove: onPreBuild = function ({
  utils: {
    cache: { remove },
  },
}) {
  expectType<Promise<boolean>>(remove('file'))
  remove(['file'])
  remove('file', {})
  remove('file', { cwd: '.' })
}

const testUtilsCacheHas: onPreBuild = function ({
  utils: {
    cache: { has },
  },
}) {
  expectType<Promise<boolean>>(has('file'))
  has(['file'])
  has('file', {})
  has('file', { cwd: '.' })
}
