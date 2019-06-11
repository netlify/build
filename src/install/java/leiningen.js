

/*
# Leiningen
if [ -f project.clj ]
then
  restore_home_cache ".m2" "maven dependencies"
  if install_deps project.clj $JAVA_VERSION $NETLIFY_CACHE_DIR/project-clj-sha
  then
    echo "Installing Leiningen dependencies"
    if lein deps
    then
      echo "Leiningen dependencies installed"
    else
      echo "Error during Leiningen install"
      exit 1
    fi
    echo "$(shasum project.clj)-$JAVA_VERSION" > $NETLIFY_CACHE_DIR/project-clj-sha
  else
    echo "Leiningen dependencies found in cache"
  fi
fi
 */
