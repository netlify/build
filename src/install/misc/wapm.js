

/*
# WAPM version
source $HOME/.wasmer/wasmer.sh
if [ -f wapm.toml ] || [ -f wapm.lock ]
then
  restore_home_cache ".wasmer/cache" "wasmer cache"
  restore_cwd_cache "wapm_packages" "wapm packages"
  wapm install
  if [ $? -eq 0 ]
  then
    echo "Wapm packages installed"
  else
    echo "Error during Wapm install"
    exit 1
  fi
fi
 */
