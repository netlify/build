export default async () => new Response(JSON.stringify(Deno.env.toObject()))
