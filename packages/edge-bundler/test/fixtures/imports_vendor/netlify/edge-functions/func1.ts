import hello from '../../vendor/hello.ts'
import hello2 from 'aliased_vendor'


export default async () => {
  return new Response(`${hello()} ${hello2()}`)
}
