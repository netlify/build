
// WIP build plugin example

function netlifyPlugin(conf) {
  return {
    // Add custom CLI commands. Converted into CLI commands
    commands: [
      {
        name: 'foobar',
        run: () => { console.log('foobar') },
        shortcut: 'fb'
      }
    ],
    // Hook into lifecycle
    init: ({ config, cancel, utils }) => {
      console.log('init thing')
      const bar = true
      if (bar) {
        return cancel('Cancel my build because reasons')
      }
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
