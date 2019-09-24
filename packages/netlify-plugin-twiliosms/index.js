const twilio = require("twilio")
const accountSid = process.env.ACCOUNT_SID // Your Account SID from www.twilio.com/console
const authToken = process.env.AUTH_TOKEN // Your Auth Token from www.twilio.com/console

const client = new twilio(accountSid, authToken)

function netlifyPlugin(conf) {
  return {
    // Hook into lifecycle
    finally: () => {
      console.log("finish the build up, prepping to text!")

      client.messages
        .create({
          body: "Hi there, we just built the site successfully!",
          to: "+447725202255", // Text this number
          from: "+16503000213" // From a valid Twilio number
        })
        .then(message => console.log(message.sid))
    }
  }
}

module.exports = netlifyPlugin
