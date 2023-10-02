export type OpenAPI = {
  /** the swagger version */
  swagger: string
  info: {
    version: string
    title: string
    description: string
    termsOfService: string
  }
  externalDocs: {
    url: string
    description: string
  }
  securityDefinitions: {
    netlifyAuth: NetlifyAuth
  }
  security: Array<{ netlifyAuth: any[] }>
  consumes: string[]
  produces: string[]
  schemes: string[]
  responses: Record<string, Property>
  host: string
  basePath: string
  paths: Record<string, Path>
  definitions: Record<string, Property>
  parameters: Record<'page' | 'perPage' | 'retryCount', Parameter>
  tags: Array<{ name: string }>
}

export type HTTPMethods = 'get' | 'post' | 'put' | 'delete'

export type Path = Record<
  HTTPMethods,
  {
    operationId: string
    tags: string[]
    parameters?: Parameter[]
    consumes?: string[]
    responses: any
    description?: string
  }
>

export type Parameter = (SchemaProperty | StringProperty | BooleanProperty | IntegerProperty) & {
  name: string
  required?: boolean
  in: 'header' | 'query' | 'body' | 'path'
}

export type BaseProperty = {
  description?: string
}

export type Property =
  | BooleanProperty
  | IntegerProperty
  | NumberProperty
  | StringProperty
  | ArrayProperty
  | ObjectProperty
  | TypeDefinition
  | SchemaProperty

export type BooleanProperty = BaseProperty & { type: 'boolean' }
export type IntegerProperty = BaseProperty & { type: 'integer'; format?: 'int32' | 'int64' }
export type NumberProperty = BaseProperty & { type: 'number' }
export type StringProperty = BaseProperty & { type: 'string'; format?: 'binary' | 'dateTime'; enum?: string[] }
export type ArrayProperty = BaseProperty & { type: 'array'; items: Property }
export type ObjectProperty = BaseProperty & {
  type: 'object'
  required?: string[]
  properties?: Record<string, Property>
  additionalProperties?: Property
}
export type SchemaProperty = BaseProperty & {
  // can be either a allOf
  // a regular object definition
  // or a string with format: binary
  schema?: ObjectProperty | TypeDefinition | StringProperty
}

export type TypeDefinition = BaseProperty & {
  allOf?: Array<Property | { properties: Record<string, Property> }>
}

export type NetlifyAuth = {
  type: string
  flow: string
  authorizationUrl: string
}
