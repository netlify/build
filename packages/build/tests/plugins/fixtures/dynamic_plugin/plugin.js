export default (inputs, metadata) => ({
  onPreBuild: ({ constants }) => {
    console.log('-> onPreBuild', constants, inputs, metadata)
  },
})
