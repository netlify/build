

/*
# Rubygems
if [ -f Gemfile ]
then
  restore_cwd_cache ".bundle" "ruby gems"
  if install_deps Gemfile.lock $RUBY_VERSION $NETLIFY_CACHE_DIR/gemfile-sha || [ ! -d .bundle ]
  then
    echo "Installing gem bundle"
    if bundle install --path $NETLIFY_CACHE_DIR/bundle --binstubs=$NETLIFY_CACHE_DIR/binstubs ${BUNDLER_FLAGS:+"$BUNDLER_FLAGS"}
    then
    export PATH=$NETLIFY_CACHE_DIR/binstubs:$PATH
      echo "Gem bundle installed"
    else
      echo "Error during gem install"
      exit 1
    fi
    echo "$(shasum Gemfile.lock)-$RUBY_VERSION" > $NETLIFY_CACHE_DIR/gemfile-sha
  else
    export PATH=$NETLIFY_CACHE_DIR/binstubs:$PATH
  fi
fi
 */
