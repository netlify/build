import { Config } from 'https://edge.netlify.com'

export default async () => {
  return new Response('Hello world')
}

export const config: Config = {
  path: '/func-3',
}
