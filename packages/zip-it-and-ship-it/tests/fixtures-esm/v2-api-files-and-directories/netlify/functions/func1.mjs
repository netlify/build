import mod3 from 'module-3'
import mod4 from 'module-4'

export default async () => {
  return Response.json({ func: 1, mod3, mod4 })
}
