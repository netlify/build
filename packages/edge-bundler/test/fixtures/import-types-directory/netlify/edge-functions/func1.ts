import type { OK } from "../../types";

export default function handler() {
  return new Response("ok" satisfies OK);
}
