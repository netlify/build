export default () => new Response('Hello, world!')

export const config = {
  path: "/daily",
  schedule: "@daily"
}