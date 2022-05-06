// intentionally break function
export async () => {
  return new Response("Helloooooo, World!", {
    headers: { "content-type": "text/html" },
  })
}
