import { greet } from 'alias:helper'
import { yell } from 'util/helper.ts'
import { echo } from '../helper.ts'

export default async () => {
  const greeting = yell(greet(echo('Jane Doe')))

  return new Response(greeting)
}
