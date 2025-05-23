import hello from '../hello.ts'

export const name = "magix"

export default async () => {
  return new Response(hello())
}
