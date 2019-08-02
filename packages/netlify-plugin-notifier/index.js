const TwilioSdk = require('twilio')

function netlifyNotifyPlugin(conf = {}) {
  // console.log(require('util').inspect(conf, {showHidden: false, depth: null}))

  if (!conf.notices) {
    return {}
  }

  const messagesByLifeCycle = conf.notices.reduce((acc, curr) => {
    if (!curr.event) {
      throw new Error('notice event is undefined', curr)
    }
    if (!acc[curr.event]) {
      acc[curr.event] = []
    }
    acc[curr.event] = acc[curr.event].concat(curr)
    return acc
  }, {})
  // console.log('messagesByLifeCycle', messagesByLifeCycle)

  const pluginMethods = Object.keys(messagesByLifeCycle).reduce((acc, curr) => {
    const messages = messagesByLifeCycle[curr]
    /* Generate notifications */
    acc[curr] = async () => {
      const runNotices = messages.map((msg) => {
        if (msg.type === 'sms') {
          console.log(`send ${msg.type} message to ${msg.to}`)
          return sendSMS(msg, conf)
        }
        if (msg.type === 'webhook') {
          console.log(`send ${msg.type} message to ${msg.to}`)
          return sendWebhook(msg, conf)
        }
        if (msg.type === 'email') {
          console.log(`send ${msg.type} message to ${msg.to}`)
          return sendEmail(msg, conf)
        }
        return Promise.resolve()
      })
      await Promise.all(runNotices)
    }
    return acc
  }, {})
  // console.log('pluginMethods', pluginMethods)

  return pluginMethods
}

function sendEmail(message, config) {
  // Todo implement email sends
}

function sendWebhook(message, config) {
  // Todo implement API requests with retry logic
}

/*
{
  postbuild: async () => {
    console.log('conf', conf)
    try {
      const message = {
        to: conf.to,
        body: conf.message,
        from: conf.TWILIO_PHONE_NUMBER,
      }
      const response = await sendSMS(message, conf)
      console.log(`text message sent!`, response.body)
      console.log(`date_created: ${response.date_created}`)
    } catch (err) {
      console.log('twilio error', err)
    }
  }
}
*/

function sendSMS(message, config) {
  return 'noOp for now'
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = config
  const twilio = new TwilioSdk(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  // add image to sms if body.image supplied
  if (message.image) {
    message.mediaUrl = message.image
  }

  return twilio.messages.create(message)
}

module.exports = netlifyNotifyPlugin
