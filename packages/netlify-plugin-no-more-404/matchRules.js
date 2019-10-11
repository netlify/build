const url = require('url')

const redirector = require('netlify-redirector')

const parseRules = require('./parseRules')

module.exports = matchRules
// https://github.com/netlify/cli/blob/0d183f0d0d44c0f6367fdb5e74d41821958da1d0/src/utils/rules-proxy.js#L90-L118
async function matchRules(relativeUrl, projectDir) {
  return getMatcher(projectDir).then(matcher => {
    const reqUrl = new url.URL(relativeUrl, 'http://temp/')
    // const cookieValues = cookie.parse(req.headers.cookie || '')
    // const headers = Object.assign(
    //   {},
    //   {
    //     'x-language': cookieValues.nf_lang || getLanguage(req),
    //     'x-country': cookieValues.nf_country || getCountry(req)
    //   },
    //   req.headers
    // )

    // Definition: https://github.com/netlify/libredirect/blob/e81bbeeff9f7c260a5fb74cad296ccc67a92325b/node/src/redirects.cpp#L28-L60
    const matchReq = {
      scheme: reqUrl.protocol,
      host: reqUrl.hostname,
      path: reqUrl.pathname,
      query: reqUrl.search.slice(1)
      // headers,
      // cookieValues,
      // getHeader: name => headers[name.toLowerCase()] || '',
      // getCookie: key => cookieValues[key] || ''
    }
    const match = matcher.match(matchReq)
    return match || null
  })
}

const getMatcher = projectDir => {
  const rules = parseRules(projectDir)
  // // spa redirect
  // .filter(
  //   r => !(r.path === '/*' && r.to === '/index.html' && r.status === 200)
  // )

  if (rules.length) {
    return redirector
      .parseJSON(JSON.stringify(rules), {
        jwtSecret: 'secret',
        jwtRole: 'app_metadata.authorization.roles'
      })
      .then(m => {
        const matcher = m
        return matcher
      })
  }
  return Promise.resolve({
    match() {
      return null
    }
  })
}
