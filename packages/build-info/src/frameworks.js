import { listFrameworks } from '@netlify/framework-info'

export const getFrameworks = async function ({ projectDir }) {
  return await listFrameworks({ projectDir })
}
