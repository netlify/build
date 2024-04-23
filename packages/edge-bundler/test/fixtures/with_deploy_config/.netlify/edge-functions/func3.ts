import { IntegrationsConfig } from 'https://edge.netlify.com'

export default async () => {
  return new Response('Hello world')
}

export const config: IntegrationsConfig = {
  path: '/func-3',
  name: 'in-config-function',
  onError: 'bypass',
}
