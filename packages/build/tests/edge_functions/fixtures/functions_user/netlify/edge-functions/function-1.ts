import { greet } from 'util/misc.ts'

export default async () => new Response(greet('friend'))
