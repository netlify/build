
function netlifySitemapPlugin(conf, createStore) {
  // you can create a simple KV store for yourself if you need one 
  // API: https://github.com/sindresorhus/conf#usage
  const store = createStore({
    // totally optional options.
    // you may want to set defaults, schema and other options
    // https://github.com/sindresorhus/conf#options
    defaults: {
      foo: {
        num: 1234,
        str: '1234',
        bool: false
      }
    }
  })

  return {
    // Hook into lifecycle
    init: () => {
      console.log('Getting str from store: ', store.get('foo.str'))
      console.log('Getting num from store: ', store.get('foo.num'))
      const rand = Math.floor(Math.random() * 100)
      console.log('Setting random number: ', rand)
      store.set('randTimes100', rand * 100)
      store.set('foo.num', rand)
      console.log('Getting str from store: ', store.get('foo.str'))
      console.log('Getting num from store: ', store.get('foo.num'))
    },
    postbuild: () => {
      // get nested key and value
      console.log('Getting str from store: ', store.get('foo.str'))
      console.log('Getting randTimes100 from store: ', store.get('randTimes100'))
      console.log('Getting num from store: ', store.get('foo.num'))
      console.log('Build finished. Create sitemap from files')
    }
  }
}

module.exports = netlifySitemapPlugin
