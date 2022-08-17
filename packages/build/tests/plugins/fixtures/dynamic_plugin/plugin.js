export default (inputs, metadata) => ({
  onPreBuild: ({ constants }) => {
    const { events, version } = metadata

    console.log('onPreBuild:')
    console.log('-> events:', [...events])
    console.log('-> version:', version)
    console.log('-> constants:', constants)
    console.log('-> inputs:', inputs)
  },
})
