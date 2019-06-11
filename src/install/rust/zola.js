
/*
# Zola
if [ -n "$ZOLA_VERSION" ]
then
  echo "Installing Zola $ZOLA_VERSION"
  zolaOut=$(binrc install -c $NETLIFY_CACHE_DIR/.binrc-$(binrc version) zola)
  if [ $? -eq 0 ]
  then
    export PATH=$(dirname $zolaOut):$PATH
  else
    echo "Error during Zola $ZOLA_VERSION install: $zolaOut"
    exit 1
  fi
fi
 */
