import { Config } from 'https://edge.netlify.com'

export default async () => new Response(JSON.stringify(Deno.env.toObject()))

export const config: Config = () => ({
  path: '/my-function',
})
