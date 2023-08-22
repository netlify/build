import pWaitFor from 'p-wait-for'

import { getMethods } from './methods/index.js'
import { openApiSpec } from './open_api.js'
import { getOperations } from './operations.js'

// 1 second
const DEFAULT_TICKET_POLL = 1e3
// 1 hour
const DEFAULT_TICKET_TIMEOUT = 3.6e6

type APIOptions = {
  /** @example 'netlify/js-client' */
  userAgent?: string
  /** @example 'https' */
  scheme?: string
  /** @example 'api.netlify.com' */
  host?: string
  /** @example '/api/v1' */
  pathPrefix?: string
  accessToken?: string
  /** @example 'HttpsProxyAgent' */
  agent?: string
  /**
   * parameters you want available for every request.
   * Global params are only sent of the OpenAPI spec specifies the provided params.
   */
  globalParams?: Record<string, unknown>
}

export abstract class NetlifyAPI {
  #accessToken: string | null = null

  defaultHeaders: Record<string, string> = {
    accept: 'application/json',
  }
  /** The protocol is used like `https` */
  scheme: string
  host: string
  pathPrefix: string
  agent?: string
  globalParams: Record<string, unknown> = {}

  constructor(options?: APIOptions)
  constructor(accessToken: string | undefined, options?: APIOptions)
  constructor(firstArg: string | undefined | APIOptions, secondArg?: APIOptions) {
    // variadic arguments
    const [accessTokenInput, options = {}] = typeof firstArg === 'object' ? [null, firstArg] : [firstArg, secondArg]

    this.globalParams = options.globalParams || {}
    this.agent = options.agent
    this.scheme = options.scheme || openApiSpec.schemes[0]
    this.host = options.host || openApiSpec.host
    this.pathPrefix = options.pathPrefix || openApiSpec.basePath
    this.#accessToken = options.accessToken || accessTokenInput || null
    this.defaultHeaders['User-agent'] = options.userAgent || 'netlify/js-client'

    const methods = getMethods({
      basePath: this.basePath,
      defaultHeaders: this.defaultHeaders,
      agent: this.agent,
      globalParams: this.globalParams,
    })
    Object.assign(this, { ...methods })
  }

  /** Retrieves the access token */
  get accessToken(): string | null {
    return this.#accessToken
  }

  set accessToken(token: string | null) {
    if (!token) {
      delete this.defaultHeaders.Authorization
      return
    }
    this.#accessToken = token
    this.defaultHeaders.Authorization = `Bearer ${this.#accessToken}`
  }

  get basePath() {
    return `${this.scheme}://${this.host}${this.pathPrefix}`
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
    } as any)

    const accessTokenResponse = await this.exchangeTicket({ ticketId: authorizedTicket.id })
    // See https://open-api.netlify.com/#/default/exchangeTicket for shape
    this.accessToken = accessTokenResponse.access_token
    return accessTokenResponse.access_token
  }

  // Those functions get implemented through the Open API implementations
  abstract showTicket(config: { ticketId: string }): Promise<{ authorized: boolean }>
  abstract exchangeTicket(config: { ticketId: string }): Promise<{ access_token: string }>
}

export const methods = getOperations()
