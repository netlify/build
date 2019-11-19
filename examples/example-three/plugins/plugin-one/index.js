module.exports = {
  name: 'netlify-plugin-one',
  methods: {
    main() {
      console.log('this is the first thing run')
      return { foo: 'wow cool' }
    },
  },
}
