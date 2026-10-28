# Vendored `@sveltejs/acorn-typescript`

A build of [sveltejs/acorn-typescript#164](https://github.com/sveltejs/acorn-typescript/pull/164)
at commit `0eca2e1`, on top of `main` at `85a27a0`. Both it and the unreleased
[sveltejs/acorn-typescript#110](https://github.com/sveltejs/acorn-typescript/pull/110)
on `main` fix parse failures that break tarball generation: #110 in vendored
declaration files, #164 for `async <T>() => {}` after an `await` or `yield` in the same
function. It is imported through the `#acorn-typescript` alias in `package.json`.

Built with `pnpm install && pnpm run build`; `index.js`, `index.d.ts` and
`LICENSE.md` are copied unmodified.

Once both are released, delete this directory, add `@sveltejs/acorn-typescript`
back to `dependencies`, point `#acorn-typescript` at it in `imports`, and remove the
`paths` entry from `tsconfig.json`.
