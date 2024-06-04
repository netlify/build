import { Config } from 'https://edge.netlify.com/'

const global = globalThis.Netlify.env.get('very_secret_secret')

export default () => {
  return Response.json({
    global,
    local: globalThis.Netlify.env.get('very_secret_secret'),
  })
}

export const config: Config = {
  path: '/global-netlify',
}
