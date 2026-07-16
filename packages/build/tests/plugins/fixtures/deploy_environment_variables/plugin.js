export const onBuild = async function ({
  utils: {
    deploy: { env },
  },
}) {
  await env.add("TEST_VARIABLE", "test-variable-value", { isSecret: true })
}
