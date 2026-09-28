# Vendored `@sveltejs/acorn-typescript`

A build of [sveltejs/acorn-typescript#110](https://github.com/sveltejs/acorn-typescript/pull/110)
at commit `6537667`, which fixes parse failures in vendored declaration files that
break tarball generation. It is imported through the `#acorn-typescript` alias in
`package.json`.

Built with `pnpm install && pnpm run build`; `index.js`, `index.d.ts` and
`LICENSE.md` are copied unmodified.

Once the PR is released, delete this directory, add `@sveltejs/acorn-typescript`
back to `dependencies`, point `#acorn-typescript` at it in `imports`, and remove the
`paths` entry from `tsconfig.json`.
