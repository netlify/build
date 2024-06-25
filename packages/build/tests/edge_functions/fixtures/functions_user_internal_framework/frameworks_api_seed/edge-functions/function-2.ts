import { greeting } from "greeting"

export default async () => new Response(greeting)

export const config = {
  excludedPath: "/framework/skip_*",
  generator: "Hello",
  path: "/framework/*"
}