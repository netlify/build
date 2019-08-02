
function netlifyNotifyPlugin(conf) {
  return {
    // Hook into lifecycle
    build: () => {
      console.log(`Send emails to ${conf.emails.join(' & ')}`)
    }
  }
}

module.exports = netlifyNotifyPlugin
