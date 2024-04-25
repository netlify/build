import dict from './dict.json' with { type: 'json' }


export default async () => Response.json(dict)
