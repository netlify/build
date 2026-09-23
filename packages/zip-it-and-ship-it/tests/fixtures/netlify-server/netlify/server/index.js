export default {
  async fetch() {
    return new Response('hello from the server')
  },
}

export const shutdown = async () => {}
