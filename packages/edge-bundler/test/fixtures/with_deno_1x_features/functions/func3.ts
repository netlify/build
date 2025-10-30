window.foo = 1

export default async () => Response.json({})

export const config = {
  path: "/with-window-global-ts"
}
