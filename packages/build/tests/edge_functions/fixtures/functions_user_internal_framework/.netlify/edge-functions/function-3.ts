export default async () => new Response("Hello")

export const config = {
  excludedPath: "/internal/skip_*",
  generator: "Hello",
  path: "/internal/*"
}