module.exports = {
  onInit({ utils }) {
    console.log(Object.keys(utils).sort().join(' '))
  },
}
