export default async () =>
  Response.json({ filename: __filename, dirname: __dirname, requiredJoin: typeof require('path').join })
