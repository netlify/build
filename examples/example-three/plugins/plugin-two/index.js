
// Option 1 - Upfront config requiremnts with 'by' for when values must exist
module.exports = function pluginTwo() {
  return {
    name: 'netlify-plugin-two',
    config: {
      bar: {
        required: true,
        // Specify when it's required to have a value or not
        by: 'init',
      },
      fizz: {
        required: true,
        // Specify when it's required to have a value or not
        by: 'build',
      }
    },
    init: ({ config }) => {
      console.log(config.bar)
    },
    build: ({ config }) => {
      console.log(config.fizz)
    },
  }
}
//
//
//
//
//
//
//
//
//
// Option 2. Specific config requirements by hook
module.exports = function pluginTwo() {
  return {
    name: 'netlify-plugin-two',
    init: {
      // Specific config requirements by hook
      config: {
        bar: {
          required: true
        }
      },
      // Code to execute as 'run'
      run: ({ config }) => {
        console.log(config.bar)
      },
    },
    build: {
      // Specific config requirements by hook
      config: {
        fizz: {
          required: true
        }
      },
      // Code to execute as 'run'
      run: ({ config }) => {
        console.log(config.bar)
      },
    },
  }
}
