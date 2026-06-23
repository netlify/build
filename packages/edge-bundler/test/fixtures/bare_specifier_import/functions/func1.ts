import { encode as base64Encode } from "my-encoding"

export default async () => {
  const encoded = base64Encode("Netlify Edge Functions")
  return new Response(encoded)
}

export const config = { path: '/func1' }
