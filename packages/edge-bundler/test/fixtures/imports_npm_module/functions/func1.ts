import parent1 from 'parent-1'
import parent3 from './helpers/util.ts'
import { echo, parent2 } from 'alias:helper'
import { encode as base64Encode } from "https://deno.land/std@0.194.0/encoding/base64.ts";

export default async () => {
  const text = [parent1('JavaScript'), parent2('APIs'), parent3('Markup'), base64Encode("Netlify")].join(', ')

  return new Response(echo(text))
}
