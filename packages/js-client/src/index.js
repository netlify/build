import pWaitFor from 'p-wait-for'

import { getMethods } from './methods/index.js'
import { openApiSpec } from './open_api.js'
import { getOperations } from './operations.js'

export class NetlifyAPI {
  constructor(firstArg, secondArg) {
    // variadic arguments
    const [accessTokenInput, opts = {}] = typeof firstArg === 'object' ? [null, firstArg] : [firstArg, secondArg]

    // default opts
    const {
      userAgent = 'netlify/js-client',
      scheme = openApiSpec.schemes[0],
      host = openApiSpec.host,
      pathPrefix = openApiSpec.basePath,
      accessToken = accessTokenInput,
      globalParams = {},
      agent,
    } = opts

    const defaultHeaders = {
      'User-agent': userAgent,
      accept: 'application/json',
    }

    const basePath = getBasePath({ scheme, host, pathPrefix })
    const methods = getMethods({ basePath, defaultHeaders, agent, globalParams })
    Object.assign(this, { ...methods, defaultHeaders, scheme, host, pathPrefix, globalParams, accessToken, agent })
  }

  get accessToken() {
    const {
      defaultHeaders: { Authorization },
    } = this
    if (typeof Authorization !== 'string' || !Authorization.startsWith('Bearer ')) {
      return null
    }

    return Authorization.replace('Bearer ', '')
  }

  set accessToken(token) {
    if (!token) {
      delete this.defaultHeaders.Authorization
      return
    }

    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  get basePath() {
    return getBasePath({ scheme: this.scheme, host: this.host, pathPrefix: this.pathPrefix })
  }

  async getAccessToken(ticket, { poll = DEFAULT_TICKET_POLL, timeout = DEFAULT_TICKET_TIMEOUT } = {}) {
    const { id } = ticket

    // ticket capture
    let authorizedTicket
    const checkTicket = async () => {
      const t = await this.showTicket({ ticketId: id })
      if (t.authorized) {
        authorizedTicket = t
      }
      return Boolean(t.authorized)
    }

    await pWaitFor(checkTicket, {
      interval: poll,
      timeout,
      message: 'Timeout while waiting for ticket grant',
    })

    const accessTokenResponse = await this.exchangeTicket({ ticketId: authorizedTicket.id })
    // See https://open-api.netlify.com/#/default/exchangeTicket for shape
    this.accessToken = accessTokenResponse.access_token
    return accessTokenResponse.access_token
  }
}

const getBasePath = function ({ scheme, host, pathPrefix }) {
  return `${scheme}://${host}${pathPrefix}`
}

// 1 second
const DEFAULT_TICKET_POLL = 1e3
// 1 hour
const DEFAULT_TICKET_TIMEOUT = 3.6e6

export const methods = getOperations()
