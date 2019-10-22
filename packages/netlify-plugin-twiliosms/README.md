# Netlify Simple Twilio SMS Plugin

Text someone when your site has finished successfully deploying.

## How to use

In your netlify config file add:

```yml
plugins:
  - type: '@netlify/plugin-twiliosms'
```

## Configuration

### Environment Variables

Add these environment variables to your project:

- **ACCOUNT_SID** - Your Account SID from www.twilio.com/console
- **AUTH_TOKEN** - Your Auth Token from www.twilio.com/console
- **TO_NUM** - The number you'll be texting, should be formatted like this: "+1650XXXXXXX"
- **FROM_NUM** - The number you'll be texting from, must be a valid Twilio number, should be formatted like this:
  "+1650XXXXXXX"
