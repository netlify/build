/* eslint-disable import/no-anonymous-default-export, fp/no-mutation */
export default () => {
  const bar = 1

  // @ts-expect-error Assigning to a constant should error.
  bar = 'foo'

  return bar
}
/* eslint-enable import/no-anonymous-default-export, fp/no-mutation */
