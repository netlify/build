import { S3Client } from '@aws-sdk/client-s3'

export default {
  async fetch() {
    return Response.json({ client: new S3Client().name })
  },
}
