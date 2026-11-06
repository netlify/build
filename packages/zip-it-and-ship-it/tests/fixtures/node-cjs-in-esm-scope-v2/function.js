const { greeting } = require('./helpers/greeting.js')

exports.default = async () => new Response(greeting)
