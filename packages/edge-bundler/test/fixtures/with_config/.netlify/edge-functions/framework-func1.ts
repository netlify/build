import { IntegrationsConfig } from 'https://edge.netlify.com'
import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('framework function 1')

  return new Response(greeting)
}

export const config: IntegrationsConfig = {
  path: '/framework-func1',
}
