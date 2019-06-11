

/*
# Hugo
if [ -n "$HUGO_VERSION" ]
then
  echo "Installing Hugo $HUGO_VERSION"
  hugoOut=$(binrc install -c $NETLIFY_CACHE_DIR/.binrc-$(binrc version) hugo)
  if [ $? -eq 0 ]
  then
    export PATH=$(dirname $hugoOut):$PATH
    hugo version
  else
    echo "Error during Hugo $HUGO_VERSION install: $hugoOut"
    exit 1
  fi
fi
 */
