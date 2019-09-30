# Netlify notifier plugin

Send messages during different build lifecycle events

## Usage:

`notices` is an array of notices to send.

```yml
plugins:
  - netlify-plugin-notifier:
      notices:
        - event: buildEnd
          type: email
          to: david@netlify.com
          subject: 'Your site is ready!'
          message: 'Horray!'
        - event: buildEnd
          type: sms
          to: '222-222-2222'
          message: 'Your build is published!'
        - event: buildFailed
          type: webhook
          endpoint: 'https://my-webhook-endpoint.com/api'
          message: 'Your site build failed sorry charlie'
```
