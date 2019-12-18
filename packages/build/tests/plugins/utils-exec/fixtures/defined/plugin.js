module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { exec } }) {
    console.log(typeof exec, Object.keys(exec).join(' '))
  },
}
