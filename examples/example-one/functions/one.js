exports.handler = (event, context, callback) => {
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      hello: 'from function one'
    })
  })
}
