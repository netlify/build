import hello from '@secret/magic/sub-path'

export default async () => {
  return new Response(hello())
}
