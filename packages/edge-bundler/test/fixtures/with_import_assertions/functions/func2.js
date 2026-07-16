import dict from './dict.json' assert { type: "json" }


export default async () => Response.json(dict)

export const config = {
  path: "/with-import-assert-js"
}
