const bundlesSchema = {
  type: 'object',
  required: ['asset', 'format'],
  properties: {
    asset: { type: 'string' },
    format: { type: 'string', enum: ['eszip2', 'js'] },
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
      errorMessage:
        'pattern needs to be a regex that starts with ^ and ends with $ without any additional slashes before and afterwards',
    },
    generator: { type: 'string' },
  },
  additionalProperties: false,
}

const functionConfigSchema = {
  type: 'object',
  required: [],
  properties: {
    excluded_patterns: {
      type: 'array',
      items: {
        type: 'string',
        format: 'regexPattern',
        errorMessage:
          'excluded_patterns needs to be an array of regex that starts with ^ and ends with $ without any additional slashes before and afterwards',
      },
    },
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
