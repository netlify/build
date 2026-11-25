const greeting = 'Hello world'

if (globalThis.module) {
  module.exports = { greeting }
}

if (globalThis.exports) {
  exports.greeting = greeting
}

export default async () => new Response(greeting)
