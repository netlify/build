const readdirp = require('readdirp')

const { CONTEXT } = process.env

module.exports = {
  name: '@netlify/plugin-deploy',

  async onDeploy({
    config: {
      build: { functions },
    },
    constants: { siteId, CONFIG_PATH, BUILD_DIR },
    api,
  }) {
    const files = await readdirp.promise(BUILD_DIR)
    if (files.length === 0) {
      throw new Error('No files found in publish dir')
    }

    if (siteId === undefined) {
      console.log(`No siteId found`)
    }

    console.log('Deploying site...')
    await api.deploy(siteId, BUILD_DIR, {
      configPath: CONFIG_PATH,
      fnDir: functions,
      statusCb() {},
      draft: CONTEXT !== 'production',
      message: 'Site deployed from @netlify/build',
    })
  },

  onError({ error: { message } }) {
    console.log('do something with error', message)
    if (message.match(/invalid json response body/)) {
      console.log('Attempt to correct build')
    }
  },
}
