import { greet } from 'alias:helper'

import { echo } from '../../../util.ts'

export default async () => {
  const greeting = greet(echo('Jane Doe'))

  return new Response(greeting)
}

export const config = {
  path: "/func2/*",
  name: "Function two",
  generator: "@netlify/fake-plugin@1.0.0",
  excludedPath: "/func2/skip"
}