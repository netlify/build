import { z } from 'zod'

import { getRoutes, type Route } from './utils/routes.js'

export type Access = { public: true } | { public_routes: Route[] }

const publicValue = z.literal('public', { message: "Must be 'public'" })

const publicRoutes = z
  .record(z.string(), publicValue, { message: "Must be an object that maps paths to 'public'" })
  .refine((routes) => Object.keys(routes).length !== 0, { message: 'Must list at least one path' })
  .refine((routes) => Object.keys(routes).every((path) => path.startsWith('/')), {
    message: "Every path must start with a '/'",
  })

export const functionAccess = z.union([publicValue, publicRoutes], {
  message: "Must be 'public' or an object that maps paths to 'public'",
})

// No `public` form, because it would also make every static file under the server's routes public.
export const serverAccess = publicRoutes

export const getAccess = (functionName: string, access: z.infer<typeof functionAccess>): Access =>
  access === 'public' ? { public: true } : { public_routes: getRoutes(functionName, Object.keys(access)) }
