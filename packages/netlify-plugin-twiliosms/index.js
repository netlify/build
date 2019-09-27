const {
  env: {
    // Your Account SID from www.twilio.com/console
    ACCOUNT_SID,
    // Your Auth Token from www.twilio.com/console
    AUTH_TOKEN,
    // Text this number
    TO_NUM,
    // From a valid Twilio number
    FROM_NUM
  }
} = require('process')

const Twilio = require('twilio')

function netlifyTwilioSms() {
  const client = new Twilio(ACCOUNT_SID, AUTH_TOKEN)

  return {
    // Hook into lifecycle
    async finally() {
      console.log('Finish the build up, prepping to text!')

      const { sid } = await client.messages.create({
        body: 'Hi there, we just deployed the site successfully!',
        to: TO_NUM,
        from: FROM_NUM
      })
      console.log(sid)
    }
  }
}

module.exports = netlifyTwilioSms
