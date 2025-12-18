import test from 'ava'
import { Fixture } from '@netlify/testing'

test('debug edge bundling', async (t) => {
  try {
    const result = await new Fixture('./fixtures/functions_user')
      .withFlags({ debug: true })
      .runWithBuildAndIntrospect()
    
    console.log('===== SUCCESS =====')
    console.log('Output:', result.output)
    console.log('Logs:', result.logs)
    console.log('Exit code:', result.exitCode)
    t.pass()
  } catch (error) {
    console.log('===== ERROR =====')
    console.log('Error:', error)
    console.log('Message:', error.message)
    console.log('Stack:', error.stack)
    t.fail(error.message)
  }
})
