// import { AsyncLocalStorage } from 'node:async_hooks'
// import { access, readFile } from 'node:fs/promises'
// import { platform, version as nodeVersion } from 'node:process'
// import { join } from 'path'
//
// import { getDeployStore } from '@netlify/blobs'
// import { BlobsServer } from '@netlify/blobs/server'
// import { Fixture } from '@netlify/testing'
// import test from 'ava'
// import getPort from 'get-port'
// import semver from 'semver'
// import { spyOn } from 'tinyspy'
// import tmp from 'tmp-promise'
//
// test.serial('Blobs upload step uploads files to deploy store', async (t) => {
//   const fixture = await new Fixture('./fixtures/src_with_blobs').withCopyRoot({ git: false })
//
//   const { success } = await fixture
//     .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
//     .runBuildProgrammatic()
//
//   t.true(success)
//
//   // 3 requests for getting pre-signed URLs + 3 requests for hitting them.
//   t.is(t.context.blobRequests.set.length, 6)
//
//   const regionAutoRequests = t.context.blobRequests.set.filter((urlPath) => {
//     const url = new URL(urlPath, 'http://localhost')
//
//     return url.searchParams.get('region') === 'auto'
//   })
//
//   t.is(regionAutoRequests.length, 3)
//
//   const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
//   const store = getDeployStore(storeOpts)
//
//   const blob1 = await store.getWithMetadata('something.txt')
//   t.is(blob1.data, 'some value')
//   t.deepEqual(blob1.metadata, {})
//
//   const blob2 = await store.getWithMetadata('with-metadata.txt')
//   t.is(blob2.data, 'another value')
//   t.deepEqual(blob2.metadata, { meta: 'data', number: 1234 })
//
//   const blob3 = await store.getWithMetadata('nested/blob')
//   t.is(blob3.data, 'file value')
//   t.deepEqual(blob3.metadata, { some: 'metadata' })
// })
//
// // test.serial('Blobs upload failure print full error stack and cause to systemlog', async (t) => {
// //   const fixture = await new Fixture('./fixtures/src_with_blobs').withCopyRoot({ git: false })
// //
// //   const systemLogFile = await tmp.file()
// //
// //   const {
// //     success,
// //     logs: { stdout, stderr },
// //   } = await fetchCustomImplementationStore.run(
// //     {
// //       fetchImplementation: (origFetch, ...args) => {
// //         if (
// //           typeof args[0] === 'string' &&
// //           args[0].includes('api/v1/blobs') &&
// //           typeof args[1] === 'object' &&
// //           args[1].method === 'put'
// //         ) {
// //           throw new Error('Simulated upload error with cause', {
// //             cause: new Error('Outer internal error', { cause: new Error('Nested internal error') }),
// //           })
// //         }
// //         return origFetch(...args)
// //       },
// //     },
// //     () =>
// //       fixture
// //         .withFlags({
// //           deployId: 'abc123',
// //           siteId: 'test',
// //           token: TOKEN,
// //           offline: true,
// //           cwd: fixture.repositoryRoot,
// //           debug: false,
// //           systemLogFile: systemLogFile.fd,
// //         })
// //         .runBuildProgrammatic(),
// //   )
// //
// //   t.false(success)
// //
// //   // No file descriptors on Windows, so system logging doesn't work.
// //   if (platform !== 'win32') {
// //     const systemLog = await readFile(systemLogFile.path, { encoding: 'utf8' })
// //     // nested internal error visible in system log
// //     t.true(systemLog.includes('Nested internal error'))
// //   }
// //
// //   // internals don't leak to regular output
// //   t.false(stdout.join('\n').includes('Nested internal error'))
// //   t.false(stderr.join('\n').includes('Nested internal error'))
// // })
