# Netlify Config

Netlify can be configured:

- In the [build settings](https://docs.netlify.com/configure-builds/get-started/).
- In a [`netlify.toml`](https://docs.netlify.com/configure-builds/file-based-configuration/) file in the repository root
  directory or site base directory.

This library loads, validates, and normalizes the Netlify configuration.

# Install

```bash
npm install @netlify/config
```

# Usage (CLI)

```bash
$ netlify-config
{
  "configPath": "/home/me/cv-website/netlify.toml",
  "buildDir": "/home/me/cv-website",
  "config": {
    "build": {
      "command": "gulp build",
      "functions": "/home/me/cv-website/functions",
      "publish": "/home/me/cv-website/build",
      "environment": {
        "NODE_VERSION": "12",
        "AWS_LAMBDA_JS_RUNTIME": "nodejs10.x"
      }
    },
    "plugins": []
  },
  "context": "production",
  "branch": "master",
  "siteInfo": {}
}

```

# Usage (Node.js)

```js
const getNetlifyConfig = require('@netlify/config')

const { configPath, buildDir, config, context, branch, siteInfo } = await getNetlifyConfig()
```
