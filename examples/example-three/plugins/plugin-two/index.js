module.exports = {
  name: 'netlify-plugin-two',
  methods: {
    // Plugin-to-plugin communication.
    // Uses the `foo` return value of `netlify-plugin-one`
    doThis({ outputs }) {
      console.log(outputs.foo)
    },
    doThat({ pluginConfig }) {
      console.log(pluginConfig.fizz)
    },
  },
}
