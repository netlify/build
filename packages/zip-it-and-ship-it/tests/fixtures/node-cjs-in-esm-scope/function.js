module.exports.handler = async () => ({ statusCode: 200, body: require('./helpers/greeting.js').greeting })
