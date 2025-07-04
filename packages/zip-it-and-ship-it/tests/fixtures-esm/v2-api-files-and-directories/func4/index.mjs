import mod3 from 'module-3'
import mod4 from 'module-4'

import { n } from './func4-util.mjs'

export default async () => {
  return Response.json({ func: n, mod3, mod4 })
}
