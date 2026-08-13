import { readFile } from 'fs/promises'
import { join } from 'path'

import { dir as getTmpDir } from 'tmp-promise'
import { describe, expect, test } from 'vitest'

import { listFunctions, zipFunctions } from '../src/main.js'
import { RUNTIME } from '../src/runtimes/runtime.js'

import { FIXTURES_DIR } from './helpers/main.js'

const FIXTURE = join(FIXTURES_DIR, 'container-function')

describe('container functions', () => {
  // The fixtures deliberately place their marker files (`oci-layout`,
  // `manifest.json`) *after* 30 blob entries, because that is what real
  // `docker save` output looks like. An earlier version of the detector only
  // inspected the first 20 entries, which passed against marker-first
  // fixtures and rejected every real image.
  test('claims OCI and Docker image archives, and nothing else', async () => {
    const listed = await listFunctions(FIXTURE, {
      featureFlags: { zisi_container_functions: true },
    })

    const containers = listed.filter((func) => func.runtime === RUNTIME.CONTAINER).map((func) => func.name)

    // `not-an-image.tar` is a valid tar that is not an image, so detection
    // must not go by extension alone.
    expect(containers.sort()).toEqual(['docker-app', 'oci-app'])
    expect(listed.some((func) => func.name === 'not-an-image')).toBe(false)
  })

  test('is inert when the feature flag is off', async () => {
    const listed = await listFunctions(FIXTURE, {
      featureFlags: { zisi_container_functions: false },
    })

    // Nothing at all: with the flag off no runtime claims a `.tar`, so the
    // archives are ignored exactly as they were before this runtime existed.
    // Asserting emptiness rather than "no containers" also catches another
    // runtime quietly picking them up.
    expect(listed).toEqual([])
  })

  test('deploys the archive as-is, without building or bundling it', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const results = await zipFunctions(FIXTURE, tmpDir, {
      featureFlags: { zisi_container_functions: true },
    })

    const result = results.find((func) => func.name === 'oci-app')

    expect(result).toBeDefined()
    expect(result!.runtime).toBe(RUNTIME.CONTAINER)
    expect(result!.path).toMatch(/oci-app\.tar$/)

    // A container is launched from its own image config, so there is no entry
    // file for the platform to call into, and no Node bootstrap shim. The
    // absent bootstrap version is why `runtime` is what identifies a container
    // downstream.
    expect(result!.entryFilename).toBe('')
    expect(result!.bootstrapVersion).toBeUndefined()

    // The artifact must arrive byte-identical: this runtime copies, it does
    // not repackage.
    const [source, deployed] = await Promise.all([readFile(join(FIXTURE, 'oci-app.tar')), readFile(result!.path)])
    expect(deployed.equals(source)).toBe(true)
  })

  test('reports the container runtime, which is what routes the deploy to Play', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const results = await zipFunctions(FIXTURE, tmpDir, {
      featureFlags: { zisi_container_functions: true },
    })

    // The CLI forwards this value as the `?runtime=` upload parameter, which
    // is what netlify-server branches on to reach the container conversion
    // endpoint. If this stops being 'container', the deploy silently becomes a
    // Node.js workload.
    const runtimes = results.map((func) => func.runtime)

    expect(runtimes).toContain('container')
  })
})
