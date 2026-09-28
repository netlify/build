import { normalize } from 'path'
import { platform } from 'process'

import { Fixture, normalizeOutput, startTcpServer } from '@netlify/testing'
import { expect, test } from 'vitest'

interface DeployRequest {
  action: string
  deployDir: string
  environment?: unknown
}

const startDeployServer = function (opts: { response?: unknown } = {}) {
  const useUnixSocket = platform !== 'win32'
  return startTcpServer<DeployRequest>({ useUnixSocket, response: { succeeded: true }, ...opts })
}

const isValidDeployReponse = function ({ action, deployDir }: DeployRequest) {
  return ['deploySite', 'deploySiteAndAwaitLive'].includes(action) && typeof deployDir === 'string' && deployDir !== ''
}

const doesNotWaitForPostProcessing = function (request: DeployRequest) {
  return request.action === 'deploySite'
}

const waitsForPostProcessing = function (request: DeployRequest) {
  return request.action === 'deploySiteAndAwaitLive'
}

test('Deploy plugin succeeds', async () => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }

  expect(requests.every(isValidDeployReponse)).toBe(true)
})

test('Deploy plugin sends deployDir as a path relative to repositoryRoot', async () => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture(import.meta.url, './fixtures/dir_path')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
  } finally {
    await stopServer()
  }

  const [{ deployDir }] = requests
  expect(deployDir).toBe(normalize('base/publish'))
})

test('Deploy plugin is not run unless --buildbotServerSocket is passed', async () => {
  const { requests, stopServer } = await startDeployServer()
  try {
    await new Fixture(import.meta.url, './fixtures/empty').runWithBuild()
  } finally {
    await stopServer()
  }

  expect(requests).toHaveLength(0)
})

test('Deploy plugin connection error', async () => {
  const { address, stopServer } = await startDeployServer()
  await stopServer()
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ buildbotServerSocket: address })
    .runWithBuild()
  expect(output).toContain('Internal error during "Deploy site"')
})

test('Deploy plugin response syntax error', async () => {
  const { address, stopServer } = await startDeployServer({ response: 'test' })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
    // This shape of this error can change with different Node.js versions.
    expect(output).toContain('Internal error during "Deploy site"')
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response system error', async () => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'system' } },
  })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response user error', async () => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user' } },
  })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }
})

test('Deploy plugin does not wait for post-processing if not using onSuccess nor onEnd', async () => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture(import.meta.url, './fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  expect(requests.every(doesNotWaitForPostProcessing)).toBe(true)
})

test('Deploy plugin waits for post-processing if using onSuccess', async () => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture(import.meta.url, './fixtures/success').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  expect(requests.every(waitsForPostProcessing)).toBe(true)
})

test('Deploy plugin waits for post-processing if using onEnd', async () => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture(import.meta.url, './fixtures/end').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  expect(requests.every(waitsForPostProcessing)).toBe(true)
})

test('Deploy plugin specifies deploy-specific variables in deploy event', async () => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture(import.meta.url, './fixtures/deploy_environment_variables')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
  } finally {
    await stopServer()
  }

  expect(requests).toHaveLength(1)
  expect(requests[0].environment).toEqual([
    {
      is_secret: false,
      key: 'DATABASE_URI',
      value: '',
      scopes: ['functions', 'post_processing', 'runtime'],
    },
    {
      is_secret: true,
      key: 'DATABASE_PASSWORD',
      value: 'collision',
      scopes: ['functions', 'runtime'],
    },
    {
      is_secret: false,
      key: 'DATABASE_MOOD',
      value: 'feisty',
      scopes: ['functions', 'post_processing', 'runtime'],
    },
  ])
})

test('Deploy plugin returns an internal deploy error if the server responds with a 500', async () => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user', code: '500' } },
  })
  try {
    const { success, severityCode, logs } = await new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ buildbotServerSocket: address })
      .runBuildProgrammatic()
    expect(success).toBe(false)
    // system-error code
    expect(severityCode).toBe(4)
    const output = logs?.stdout.join('\n')
    expect(output).toContain('Internal error deploying')
    expect(output).toContain('Deploy did not succeed with HTTP Error 500')
  } finally {
    await stopServer()
  }
})

test('Deploy plugin returns a  deploy error if the server responds with a 4xx', async () => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user', code: '401' } },
  })
  try {
    const { success, severityCode, logs } = await new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ buildbotServerSocket: address })
      .runBuildProgrammatic()
    expect(success).toBe(false)
    // user-error code
    expect(severityCode).toBe(2)
    const output = logs?.stdout.join('\n')
    expect(output).toContain('Error deploying')
    expect(output).toContain('Deploy did not succeed with HTTP Error 401')
  } finally {
    await stopServer()
  }
})
