

/*
# zip-it-and-ship-it
if [ -n "$ZISI_VERSION" ]
then
  echo "Installing Zip-it-and-ship-it $ZISI_VERSION"

  zisiOut=$(binrc install -c $NETLIFY_BUILD_BASE/.binrc netlify/zip-it-and-ship-it $ZISI_VERSION)
  if [ $? -eq 0 ]
  then
    ln -s $zisiOut /opt/buildhome/.binrc/bin/zip-it-and-ship-it_${ZISI_VERSION}
    ln -s /opt/buildhome/.binrc/bin/zip-it-and-ship-it_${ZISI_VERSION} /opt/buildhome/.binrc/bin/zip-it-and-ship-it
    echo zip-it-and-ship-it version: $(zip-it-and-ship-it --version)
  else
    echo "Error during Zip-it-and-ship-it $ZISI_VERSION install: $zisiOut"
    exit 1
  fi
fi
 */
