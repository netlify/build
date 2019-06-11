


/*
# Boot
if [ -f build.boot ]
then
  restore_home_cache ".m2" "maven dependencies"
  restore_home_cache ".boot" "boot dependencies"
  if install_deps build.boot $JAVA_VERSION $NETLIFY_CACHE_DIR/project-boot-sha
  then
    echo "Installing Boot dependencies"
    if boot pom jar install
    then
      echo "Boot dependencies installed"
    else
      echo "Error during Boot install"
      exit 1
    fi
    echo "$(shasum build.boot)-$JAVA_VERSION" > $NETLIFY_CACHE_DIR/project-boot-sha
  else
    echo "Boot dependencies found in cache"
  fi
fi
 */
