import { getURL } from '@netlify/edge-functions-bootstrap/version'

import { DenoBridge } from '../node/bridge.js'

export default async function setup() {
  const deno = new DenoBridge({})
  const bootstrapURL = await getURL()

  await deno.run(['install', '--allow-import', '--entrypoint', bootstrapURL])
}
