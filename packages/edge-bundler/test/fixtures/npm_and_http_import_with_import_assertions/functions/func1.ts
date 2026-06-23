import data1 from 'package-with-import-assertions'
import data2 from "https://remote-import-assertions.netlify.app/modules/remote.js";

export default async () => {
  const text = [data1,data2].join(', ')
  return new Response("ok")
}

export const config = { path: '/func1' }
