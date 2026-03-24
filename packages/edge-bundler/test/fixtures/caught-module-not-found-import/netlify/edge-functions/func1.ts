try {
  await import("./some-module-that-does-not-exist.js");
} catch (error) {
  console.error("Error importing module but we continue anyway:", error);
}

export default function Handler() {
  return new Response("ok");
}

export const config = {
  path: "/*",
};
