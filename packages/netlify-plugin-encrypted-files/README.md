this plugin is an unusual one. it has a CLI that works outside of the build bot.

the idea is:

0. you should have your site linked with the Netlify CLI
1. while developing, work with your files as normal

- before committing, run `netlify-encrypt fileRegex` (regex for files)
- make sure encrypted files are gitignored
- `encrypt` will encrypt your files to the `.encrypt` folder with the `NETLIFY_ENCRYPT_KEY` environment variable

2. while deploying, this plugin runs before any build and decrypts it with the same env variable
3. for collaborators, they should run `netlify-decrypt` on git pull
