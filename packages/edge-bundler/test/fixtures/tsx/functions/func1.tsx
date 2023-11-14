import React from 'react'

export default () => {
  try {
    // this is expected to fail
    process.env.FOO
  } catch {
    return new Response(<p>Hello World</p>)
  }
}
