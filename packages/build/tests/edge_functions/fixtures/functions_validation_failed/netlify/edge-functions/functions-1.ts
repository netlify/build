import { Config } from "https://edge.netlify.com";

export default () => new Response("Hello world");

export const config: Config = {
  path: ["/hello/*", "hello/"],
};
