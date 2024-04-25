import { foo } from 'alias:util'

export default async () => new Response(foo && 'Hello world')
