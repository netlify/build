/* dead? https://dev.to/ruthreyer/tea-site-built-with-gutenberg-1c0b https://www.getgutenberg.io/
# Gutenberg
if [ -n "$GUTENBERG_VERSION" ]
then
  echo "Installing Gutenberg $GUTENBERG_VERSION"
  gutenbergOut=$(binrc install -c $NETLIFY_CACHE_DIR/.binrc-$(binrc version) gutenberg)
  if [ $? -eq 0 ]
  then
    export PATH=$(dirname $gutenbergOut):$PATH
  else
    echo "Error during Gutenberg $GUTENBERG_VERSION install: $gutenbergOut"
    exit 1
  fi
fi
 */
