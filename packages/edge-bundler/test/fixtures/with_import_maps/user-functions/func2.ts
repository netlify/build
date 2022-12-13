import { echo } from 'helper'

export default async () => {
  const greeting = echo('Jane Doe')

  return new Response(greeting)
}
