# Build Info

Build info is the core part of detecting settings and heuristics about the users code. The library is platform agnostic
to be used in our React UI, Node.js CLI and build system.

It provides a layered approach to detecting the following information:

1. Package Manager
2. Workspaces (pnpm, yarn, npm)
3. Build Systems
4. Frameworks
5. Build Settings

How to use it: First of all, you need to create a `FileSystem` that works for your platform. For Node.js we ship already
one that can be used: For other platforms, a file system needs to implement the `FileSystem` interface:

```typescript
import { FileSystem } from '@netlify/build-info'

export class WebFS extends FileSystem {
  // ...
}
```

After that the core piece is the Project that needs to be initialized with a file system, the base directory and an
optional repository root.

It is important to note that setting a node version is important for some frameworks to load the correct plugins.

```typescript
const project = new Project(fs, baseDir, root).setEnvironment(process.env).setNodeVersion(process.version)
```

after that on the project, we can call multiple methods like `getBuildSettings` which is running all the other steps as
well.

# Example (CLI)

```bash
# will use the current working directory as base directory
$ build-info

$ build-info /project/root/dir

$ build-info path/to/site --rootDir /project/root/dir

```

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
