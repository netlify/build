

/*
# PHP version
: ${PHP_VERSION="$defaultPHPVersion"}
if [ -f /usr/bin/php$PHP_VERSION ]
then
  if ln -sf /usr/bin/php$PHP_VERSION $HOME/.php/php
  then
    echo "Using PHP version $PHP_VERSION"
  else
    echo "Failed to switch to PHP version $PHP_VERSION"
    exit 1
  fi
else
  echo "PHP version $PHP_VERSION does not exist"
  exit 1
fi
 */
