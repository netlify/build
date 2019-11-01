# Netlify Simple Twilio SMS Plugin

Text someone when your site has finished successfully deploying.

## How to use

In your netlify config file add:

```yml
plugins:
  - type: '@netlify/plugin-twiliosms'
```

## Configuration

- `message` - Message in the SMS. Defaults to `'Hi there, we just deployed the site successfully!'`
- `to` - SMS phone number to send message to. Defaults to `process.env.TO_NUM`
- `from` - SMS phone number to send message from. Defaults to `process.env.FROM_NUM`

```yml
plugins:
  - type: '@netlify/plugin-twiliosms'
    config:
      to: 111-111-2222
      from: 333-333-3333
      message: Yay deploy is done!
```

### Environment Variables

Add these environment variables to your project:

- **ACCOUNT_SID** - Your Account SID from www.twilio.com/console
- **AUTH_TOKEN** - Your Auth Token from www.twilio.com/console
- **TO_NUM** - The number you'll be texting, should be formatted like this: "+1650XXXXXXX"
- **FROM_NUM** - The number you'll be texting from, must be a valid Twilio number, should be formatted like this:
  "+1650XXXXXXX"
