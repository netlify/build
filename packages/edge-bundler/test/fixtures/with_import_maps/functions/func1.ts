import { greet } from 'alias:helper'

import { echo } from '../helper.ts'

export default async () => {
  const greeting = greet(echo('Jane Doe'))

  return new Response(greeting)
}
