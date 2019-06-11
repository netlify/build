# Current build flow

Paraphrased from `https://github.com/netlify/buildbot/blob/master/docs/overview.md`

1. Bitballon API call to buildbot https://github.com/netlify/bitballoon/blob/358dd0238eecf60407ebfd45d80816a4a3cb3a07/app/models/build.rb

2. This schedules job in kubernetes https://github.com/netlify/bitballoon/blob/master/config/buildbot-pod.yml.erb

3. Build images starts here: https://github.com/netlify/buildbot/blob/a52e0756a15e47de4d39c1accd40c26aaccca809/script/entrypoint.sh and starts the buildbot https://github.com/netlify/buildbot/blob/master/cmd/root_cmd.go#L44. This CLI takes these inputs https://github.com/netlify/buildbot/blob/master/messages/cmd_data.go

4. The GO buildbot contains these stages https://github.com/netlify/buildbot/blob/master/bot/stage.go#L13-L22.

    - Download cache
    - Prepare Repo
    - Build Stage

5. `netlify.toml` is parsed here https://github.com/netlify/buildbot/blob/0e999a5c3d0ead62ee63a449377cf00cba9ef896/bot/stage_build.go#L34 in Go.

6. The build stage from 4, starts up this script https://github.com/netlify/buildbot/blob/master/script/run-build.sh which runs this script here https://github.com/netlify/buildbot/blob/0e999a5c3d0ead62ee63a449377cf00cba9ef896/bot/stage_build.go#L86-L97 which runs https://github.com/netlify/build-image/blob/xenial/run-build-functions.sh in the Build IMAGE.

    This build IMAGE (not Go) does this:

    - The cache files are moved into place
    - All of the user customizable tools are boostrapped and restored from cache here
    - Files are moved back out of place into the cache (things like node_modules etc)
    - Functions are zipped and shipped with https://github.com/netlify/zip-it-and-ship-it

    Build image deps are listed in https://raw.githubusercontent.com/netlify/build-image/xenial/Dockerfile

6. Then the buildbot Go continues with these stages

    - Deploy Stage (Creates a deploy and uploads the results to the API)
    - Cleanup stage (Deletes things)
    - Cache save (upload new cache files)
