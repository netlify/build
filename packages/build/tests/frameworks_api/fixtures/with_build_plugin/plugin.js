import assert from "assert"

export const onPreBuild = function ({ netlifyConfig }) {
  assert.deepStrictEqual(netlifyConfig.images, undefined)
}

export const onBuild = function ({ netlifyConfig }) {
  assert.deepStrictEqual(netlifyConfig.images, { remote_images: ["domain1.from-api.netlify", "domain2.from-api.netlify"] })

  netlifyConfig.images.remote_images.push("domain1.from-plugin.netlify")
}

export const onPostBuild = function ({ netlifyConfig }) {
  assert.deepStrictEqual(netlifyConfig.images, { remote_images: ["domain1.from-api.netlify", "domain2.from-api.netlify", "domain1.from-plugin.netlify"] })
}
