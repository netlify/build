import { IntegrationsConfig } from 'https://edge.netlify.com'
import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('framework function 3')

  return new Response(greeting)
}

export const config: IntegrationsConfig = {
  pattern: '/framework-func3(/.*)?',
  excludedPattern: '/framework-func3/excluded',
}
