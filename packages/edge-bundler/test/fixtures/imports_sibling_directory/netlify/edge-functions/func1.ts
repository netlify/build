// Import JSON from sibling directory using relative path
import appConfig from '../../data/config.json' with { type: 'json' }
import items from '../../data/items.json' with { type: 'json' }

export default async () => {
  return Response.json({
    appName: appConfig.name,
    itemCount: items.length,
  })
}

export const config = { path: '/func1' }
