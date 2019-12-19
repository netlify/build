// eslint-disable-next-line no-unused-vars
module.exports.handler = async function(event, context) {
  return { statusCode: 200, body: String(Date.now()) }
}
