
// WIP build plugin example

function netlifyPlugin(conf) {
  return {
    // Add custom CLI commands
    commands: [
      {
        name: 'foobar',
        run: () => { console.log('foobar') },
        shortcut: 'fb'
      }
    ],
    // Hook into lifecycle
    init: () => {
      console.log('init thing')
    },
    build: () => {
      console.log('build thing')
    },
    manifest: () => {
      console.log('manifest thing')
    }
  }
}

module.exports = netlifyPlugin
