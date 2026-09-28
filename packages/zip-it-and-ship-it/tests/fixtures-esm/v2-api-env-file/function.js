import { config } from 'fake-dotenv'

config()

export default async () => new Response(process.env.MY_SECRET)
