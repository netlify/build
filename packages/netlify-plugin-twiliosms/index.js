const Twilio = require('twilio')

const {
  // Your Account SID from www.twilio.com/console
  ACCOUNT_SID,
  // Your Auth Token from www.twilio.com/console
  AUTH_TOKEN,
  // Text this number
  TO_NUM,
  // From a valid Twilio number
  FROM_NUM,
} = process.env

module.exports = {
  name: '@netlify/plugin-twiliosms',
  onEnd: async ({ pluginConfig }) => {
    console.log('Finish the build up, prepping to text!')
    if (!ACCOUNT_SID) {
      throw new Error('No ACCOUNT_SID found for twilio plugin')
    }
    if (!AUTH_TOKEN) {
      throw new Error('No AUTH_TOKEN found for twilio plugin')
    }
    if (!TO_NUM) {
      throw new Error('No TO_NUM found for twilio plugin')
    }
    if (!FROM_NUM) {
      throw new Error('No FROM_NUM found for twilio plugin')
    }

    const client = new Twilio(ACCOUNT_SID, AUTH_TOKEN)
    const message = pluginConfig.message || 'Hi there, we just deployed the site successfully!'
    const { sid } = await client.messages.create({
      body: message,
      to: pluginConfig.to || TO_NUM,
      from: pluginConfig.from | FROM_NUM,
    })
    console.log(sid)
  },
}
