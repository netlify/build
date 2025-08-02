import dict from './dict.json' assert { type: "json" }


export default async () => Response.json(dict)
