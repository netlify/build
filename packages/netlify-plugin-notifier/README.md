# Netlify notifier plugin

Send messages during different build lifecycle events

## Usage:

`notices` is an array of notices to send.

```yml
plugins:
  - type: '@netlify/plugin-notifier'
    config:
      notices:
        - event: onPostBuild
          type: email
          to: david@netlify.com
          subject: 'Your site is ready!'
          message: 'Horray!'
        - event: onPostBuild
          type: sms
          to: '222-222-2222'
          message: 'Your build is published!'
        - event: onError
          type: webhook
          endpoint: 'https://my-webhook-endpoint.com/api'
          message: 'Your site build failed sorry charlie'
```
