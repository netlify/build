import { IntegrationsConfig } from 'https://edge.netlify.com'
import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('framework function 4')

  return new Response(greeting)
}

export const config: IntegrationsConfig = {
  pattern: ['/framework-func4(/.*)?', '/framework-func4-alt(/.*)?'],
  excludedPattern: ['/framework-func4/excluded', '/framework-func4-alt/excluded'],
}
