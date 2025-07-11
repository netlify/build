const bundlesSchema = {
  type: 'object',
  required: ['asset', 'format'],
  properties: {
    asset: { type: 'string' },
    format: { type: 'string', enum: ['eszip2', 'js'] },
  },
  additionalProperties: false,
}

const excludedPatternsSchema = {
  type: 'array',
  items: {
    type: 'string',
    format: 'regexPattern',
    errorMessage:
      'excluded_patterns must be an array of regex that starts with ^ and ends with $ (e.g. ^/blog/[d]{4}$)',
  },
}

const headersSchema = {
  type: 'object',
  patternProperties: {
    '.*': {
      type: 'object',
      required: ['style'],
      properties: {
        pattern: {
          type: 'string',
          format: 'regexPattern',
        },
        style: {
          type: 'string',
          enum: ['exists', 'missing', 'regex'],
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          style: { const: 'regex' },
        },
      },
      then: {
        required: ['pattern'],
      },
    },
  },
  additionalProperties: false,
}

const routesSchema = {
  type: 'object',
  required: ['function', 'pattern'],
  properties: {
    name: { type: 'string' },
    function: { type: 'string' },
    pattern: {
      type: 'string',
      format: 'regexPattern',
      errorMessage: 'pattern must be a regex that starts with ^ and ends with $ (e.g. ^/blog/[d]{4}$)',
    },
    excluded_patterns: excludedPatternsSchema,
    generator: { type: 'string' },
    path: { type: 'string' },
    methods: {
      type: 'array',
      items: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] },
    },
    headers: headersSchema,
  },
  additionalProperties: false,
}

const functionConfigSchema = {
  type: 'object',
  required: [],
  properties: {
    excluded_patterns: excludedPatternsSchema,
    on_error: { type: 'string' },
  },
}

const layersSchema = {
  type: 'object',
  required: ['flag', 'name'],
  properties: {
    flag: { type: 'string' },
    name: { type: 'string' },
    local: { type: 'string' },
  },
  additionalProperties: false,
}

const edgeManifestSchema = {
  type: 'object',
  required: ['bundles', 'routes', 'bundler_version'],
  properties: {
    bundles: {
      type: 'array',
      items: bundlesSchema,
    },
    routes: {
      type: 'array',
      items: routesSchema,
    },
    post_cache_routes: {
      type: 'array',
      items: routesSchema,
    },
    layers: {
      type: 'array',
      items: layersSchema,
    },
    import_map: { type: 'string' },
    bundler_version: { type: 'string' },
    function_config: { type: 'object', additionalProperties: functionConfigSchema },
  },
  additionalProperties: false,
}

export default edgeManifestSchema
