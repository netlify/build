const TwilioSdk = require('twilio')

const pkg = require('./package.json')

module.exports = function netlifyNotifyPlugin({ notices, sms, email, webhook }) {
  if (!notices) {
    console.log(`No notices found on ${pkg.name} plugin config`)
    return {}
  }

  const messagesByLifeCycle = notices.reduce((acc, curr) => {
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
      const runNotices = messages.map(msg => {
        if (msg.type === 'sms') {
          console.log(`Sending ${msg.type} message to ${msg.to}...`)
          return sendSMS(msg, sms)
        }
        if (msg.type === 'webhook') {
          console.log(`Sending ${msg.type} message to ${msg.to}...`)
          return sendWebhook(msg, email)
        }
        if (msg.type === 'email') {
          console.log(`Sending ${msg.type} message to ${msg.to}...`)
          return sendEmail(msg, webhook)
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

function sendEmail(message, emailConfig) {
  // Todo implement email sends
}

function sendWebhook(message, webhookConfig) {
  // Todo implement API requests with retry logic
}

/*
{
  postBuild: async () => {
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

function sendSMS(message, smsConfig) {
  if (!smsConfig || !smsConfig.provider) {
    throw new Error('No sms provider configured')
  }

  if (smsConfig.provider === 'twilio') {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = smsConfig
    if (!TWILIO_ACCOUNT_SID) {
      throw new Error('No TWILIO_ACCOUNT_SID supplied to notifier plugin')
    }
    if (!TWILIO_AUTH_TOKEN) {
      throw new Error('No TWILIO_AUTH_TOKEN supplied to notifier plugin')
    }
    if (!TWILIO_PHONE_NUMBER) {
      throw new Error('No TWILIO_PHONE_NUMBER supplied to notifier plugin')
    }

    const twilio = new TwilioSdk(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    // add image to sms if body.image supplied
    if (message.image) {
      message.mediaUrl = message.image
    }
    if (message.message) {
      message.body = message.message
    }
    // Todo make configurable on message level
    message.from = TWILIO_PHONE_NUMBER

    return twilio.messages.create(message)
  }
}
