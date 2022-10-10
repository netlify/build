[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301
  force = false
  query = {path = ":path"}
  conditions = {Language = ["en"], Country = ["US"], Role = ["admin"]}

## This rule redirects to an external API, signing requests with a secret
[[redirects]]
  from = "/search"
  to = "https://api.mysearch.com"
  status = 200
  force = true # COMMENT: ensure that we always redirect
  headers = {X-From = "Netlify"}
  signed = "API_SIGNATURE_TOKEN"
