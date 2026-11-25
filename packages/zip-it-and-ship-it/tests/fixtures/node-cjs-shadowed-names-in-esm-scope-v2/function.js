const greeting = 'Hello world'

const register = function (module, exports) {
  module.exports = { greeting }
  exports.greeting = greeting
}

register({}, {})

export default async () => new Response(greeting)
