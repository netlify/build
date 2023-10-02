import { test, expect, describe } from 'vitest'

import { createMethodParams, createTypeFromSchema, printNode } from './helpers.js'
import type { Parameter } from './open-api.js'

test('should create a simple string type literal property', () => {
  const node = createTypeFromSchema({ state: { type: 'string' } })
  expect(printNode(node)).toMatchInlineSnapshot(`
    "{
        state?: string;
    }"
  `)
})

test('should create a simple string[] type literal property', () => {
  const node = createTypeFromSchema({ state: { type: 'array', items: { type: 'string' } } })
  expect(printNode(node)).toMatchInlineSnapshot(`
    "{
        state?: string[];
    }"
  `)
})

test('should create complex type literal with enums and description', () => {
  const schema = {
    type: 'object',
    properties: {
      state: { type: 'string' },
      domains: { type: 'array', items: { type: 'string' } },
      scopes: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['builds', 'functions', 'runtime', 'post-processing'],
        },
        description: 'The scopes that this environment variable is set to',
      },
      created_at: { type: 'string' },
    },
  }
  const node = createTypeFromSchema(schema.properties)
  expect(printNode(node)).toMatchInlineSnapshot(`
    "{
        state?: string;
        domains?: string[];
        /** The scopes that this environment variable is set to */
        scopes?: (\\"builds\\" | \\"functions\\" | \\"runtime\\" | \\"post-processing\\")[];
        created_at?: string;
    }"
  `)
})

test('create a type literal with nested objects', () => {
  const schema = {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'The environment variable key, like ALGOLIA_ID (case-sensitive)',
      },
      scopes: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['builds', 'functions', 'runtime', 'post-processing'],
        },
        description: 'The scopes that this environment variable is set to',
      },
      values: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: "The environment variable value's universally unique ID",
            },
            value: {
              type: 'string',
              description: "The environment variable's unencrypted value",
            },
            context: {
              type: 'string',
              enum: ['all', 'dev', 'branch-deploy', 'deploy-preview', 'production', 'branch'],
              description:
                'The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.',
            },
            context_parameter: {
              type: 'string',
              description:
                'An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.',
            },
          },
          description: 'Environment variable value model definition',
        },
        description: 'An array of Value objects containing values and metadata',
      },
      is_secret: {
        type: 'boolean',
        description:
          'Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only)',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'The timestamp of when the value was last updated',
      },
      updated_by: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: "The user's unique identifier",
          },
          full_name: {
            type: 'string',
            description: "The user's full name (first and last)",
          },
          email: {
            type: 'string',
            description: "The user's email address",
          },
          avatar_url: {
            type: 'string',
            description: "A URL pointing to the user's avatar",
          },
        },
      },
    },
    description: 'Environment variable model definition',
  }

  const node = createTypeFromSchema(schema.properties)
  expect(printNode(node)).toMatchInlineSnapshot(`
    "{
        /** The environment variable key, like ALGOLIA_ID (case-sensitive) */
        key?: string;
        /** The scopes that this environment variable is set to */
        scopes?: (\\"builds\\" | \\"functions\\" | \\"runtime\\" | \\"post-processing\\")[];
        /** An array of Value objects containing values and metadata */
        values?: {
            /** The environment variable value's universally unique ID */
            id?: string;
            /** The environment variable's unencrypted value */
            value?: string;
            /** The deploy context in which this value will be used. \`dev\` refers to local development when running \`netlify dev\`. */
            context?: \\"all\\" | \\"dev\\" | \\"branch-deploy\\" | \\"deploy-preview\\" | \\"production\\" | \\"branch\\";
            /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when \`context=branch\`. */
            context_parameter?: string;
        }[];
        /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
        is_secret?: boolean;
        /** The timestamp of when the value was last updated */
        updated_at?: string;
        updated_by?: {
            /** The user's unique identifier */
            id?: string;
            /** The user's full name (first and last) */
            full_name?: string;
            /** The user's email address */
            email?: string;
            /** A URL pointing to the user's avatar */
            avatar_url?: string;
        };
    }"
  `)
})

describe('method parameter rendering', () => {
  test('render swagger parameters as a method parameter', () => {
    const params: Parameter[] = [
      {
        name: 'account_id',
        description: 'Scope response to account_id',
        type: 'string',
        required: true,
        in: 'path',
      },
      {
        name: 'key',
        description: 'The environment variable key (case-sensitive)',
        type: 'string',
        required: true,
        in: 'path',
      },
      {
        name: 'site_id',
        description: 'If provided, return the environment variable for a specific site (no merging is performed)',
        type: 'string',
        required: false,
        in: 'query',
      },
    ]

    const node = createMethodParams(params)[0]
    expect(printNode(node)).toMatchInlineSnapshot(`
    "config: {
        /** Scope response to account_id */
        account_id: string;
        /** The environment variable key (case-sensitive) */
        key: string;
        /** If provided, return the environment variable for a specific site (no merging is performed) */
        site_id?: string;
    }"
  `)
  })

  test('render swagger parameters that are all optional as a method parameter', () => {
    const params: Parameter[] = [
      {
        name: 'account_id',
        description: 'Scope response to account_id',
        type: 'string',
        required: false,
        in: 'path',
      },
      {
        name: 'key',
        description: 'The environment variable key (case-sensitive)',
        type: 'string',
        in: 'path',
      },
      {
        name: 'site_id',
        description: 'If provided, return the environment variable for a specific site (no merging is performed)',
        type: 'string',
        in: 'query',
      },
    ]

    const node = createMethodParams(params)
    expect(printNode(node[0])).toMatchInlineSnapshot(`
    "config: {
        /** Scope response to account_id */
        account_id?: string;
        /** The environment variable key (case-sensitive) */
        key?: string;
        /** If provided, return the environment variable for a specific site (no merging is performed) */
        site_id?: string;
    } = {}"
  `)
  })

  test('render nested swagger parameters', () => {
    const params: Parameter[] = [
      {
        name: 'dns_record',
        in: 'body',
        required: false,
        schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
            },
            hostname: {
              type: 'string',
            },
          },
        },
        description: 'some description',
      },
      {
        name: 'other',
        in: 'body',
        required: false,
        type: 'string',
      },
    ]
    const node = createMethodParams(params)[0]
    expect(printNode(node)).toMatchInlineSnapshot(`
      "config: {
          type?: string;
          hostname?: string;
          other?: string;
      } = {}"
    `)
  })

  test('render generic object as parameter', () => {
    const params: Parameter[] = [
      {
        name: 'branch_tests',
        in: 'body',
        required: true,
        schema: {
          type: 'object',
          properties: {
            branch_tests: {
              type: 'object',
            },
          },
        },
      },
    ]
    const node = createMethodParams(params)[0]
    expect(printNode(node)).toMatchInlineSnapshot(`
      "config: {
          branch_tests?: object;
      }"
    `)
  })

  test('render parameter with allOf schema', () => {
    const params: Parameter[] = [
      {
        name: 'site',
        in: 'body',
        schema: {
          allOf: [
            {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                plan: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                custom_domain: {
                  type: 'string',
                },
                domain_aliases: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                branch_deploy_custom_domain: {
                  type: 'string',
                },
                deploy_preview_custom_domain: {
                  type: 'string',
                },
                password: {
                  type: 'string',
                },
                notification_email: {
                  type: 'string',
                },
                url: {
                  type: 'string',
                },
                ssl_url: {
                  type: 'string',
                },
                admin_url: {
                  type: 'string',
                },
                screenshot_url: {
                  type: 'string',
                },
                created_at: {
                  type: 'string',
                  format: 'dateTime',
                },
                updated_at: {
                  type: 'string',
                  format: 'dateTime',
                },
                user_id: {
                  type: 'string',
                },
                session_id: {
                  type: 'string',
                },
                ssl: {
                  type: 'boolean',
                },
                force_ssl: {
                  type: 'boolean',
                },
                managed_dns: {
                  type: 'boolean',
                },
                deploy_url: {
                  type: 'string',
                },
                published_deploy: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    site_id: {
                      type: 'string',
                    },
                    user_id: {
                      type: 'string',
                    },
                    build_id: {
                      type: 'string',
                    },
                    state: {
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                    url: {
                      type: 'string',
                    },
                    ssl_url: {
                      type: 'string',
                    },
                    admin_url: {
                      type: 'string',
                    },
                    deploy_url: {
                      type: 'string',
                    },
                    deploy_ssl_url: {
                      type: 'string',
                    },
                    screenshot_url: {
                      type: 'string',
                    },
                    review_id: {
                      type: 'number',
                    },
                    draft: {
                      type: 'boolean',
                    },
                    required: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    required_functions: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    error_message: {
                      type: 'string',
                    },
                    branch: {
                      type: 'string',
                    },
                    commit_ref: {
                      type: 'string',
                    },
                    commit_url: {
                      type: 'string',
                    },
                    skipped: {
                      type: 'boolean',
                    },
                    created_at: {
                      type: 'string',
                      format: 'dateTime',
                    },
                    updated_at: {
                      type: 'string',
                      format: 'dateTime',
                    },
                    published_at: {
                      type: 'string',
                      format: 'dateTime',
                    },
                    title: {
                      type: 'string',
                    },
                    context: {
                      type: 'string',
                    },
                    locked: {
                      type: 'boolean',
                    },
                    review_url: {
                      type: 'string',
                    },
                    site_capabilities: {
                      type: 'object',
                      properties: {
                        large_media_enabled: {
                          type: 'boolean',
                        },
                      },
                    },
                    framework: {
                      type: 'string',
                    },
                    function_schedules: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                          },
                          cron: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
                account_name: {
                  type: 'string',
                },
                account_slug: {
                  type: 'string',
                },
                git_provider: {
                  type: 'string',
                },
                deploy_hook: {
                  type: 'string',
                },
                capabilities: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                  },
                },
                processing_settings: {
                  type: 'object',
                  properties: {
                    skip: {
                      type: 'boolean',
                    },
                    css: {
                      type: 'object',
                      properties: {
                        bundle: {
                          type: 'boolean',
                        },
                        minify: {
                          type: 'boolean',
                        },
                      },
                    },
                    js: {
                      type: 'object',
                      properties: {
                        bundle: {
                          type: 'boolean',
                        },
                        minify: {
                          type: 'boolean',
                        },
                      },
                    },
                    images: {
                      type: 'object',
                      properties: {
                        optimize: {
                          type: 'boolean',
                        },
                      },
                    },
                    html: {
                      type: 'object',
                      properties: {
                        pretty_urls: {
                          type: 'boolean',
                        },
                      },
                    },
                  },
                },
                build_settings: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                    },
                    provider: {
                      type: 'string',
                    },
                    deploy_key_id: {
                      type: 'string',
                    },
                    repo_path: {
                      type: 'string',
                    },
                    repo_branch: {
                      type: 'string',
                    },
                    dir: {
                      type: 'string',
                    },
                    functions_dir: {
                      type: 'string',
                    },
                    cmd: {
                      type: 'string',
                    },
                    allowed_branches: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    public_repo: {
                      type: 'boolean',
                    },
                    private_logs: {
                      type: 'boolean',
                    },
                    repo_url: {
                      type: 'string',
                    },
                    env: {
                      type: 'object',
                      additionalProperties: {
                        type: 'string',
                      },
                    },
                    installation_id: {
                      type: 'integer',
                    },
                    stop_builds: {
                      type: 'boolean',
                    },
                  },
                },
                id_domain: {
                  type: 'string',
                },
                default_hooks_data: {
                  type: 'object',
                  properties: {
                    access_token: {
                      type: 'string',
                    },
                  },
                },
              },
            },
            {
              properties: {
                repo: {
                  type: 'object',
                  properties: {
                    allowed_branches: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    repo_url: {
                      type: 'string',
                    },
                    env: {
                      type: 'object',
                      additionalProperties: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        name: 'configure_dns',
        type: 'boolean',
        in: 'query',
      },
      {
        name: 'account_slug',
        in: 'path',
        type: 'string',
        required: true,
      },
    ]
    const node = createMethodParams(params)[0]
    expect(printNode(node)).toMatchInlineSnapshot(`
      "config: {
          site?: {
              id?: string;
              state?: string;
              plan?: string;
              name?: string;
              custom_domain?: string;
              domain_aliases?: string[];
              branch_deploy_custom_domain?: string;
              deploy_preview_custom_domain?: string;
              password?: string;
              notification_email?: string;
              url?: string;
              ssl_url?: string;
              admin_url?: string;
              screenshot_url?: string;
              created_at?: string;
              updated_at?: string;
              user_id?: string;
              session_id?: string;
              ssl?: boolean;
              force_ssl?: boolean;
              managed_dns?: boolean;
              deploy_url?: string;
              published_deploy?: {
                  id?: string;
                  site_id?: string;
                  user_id?: string;
                  build_id?: string;
                  state?: string;
                  name?: string;
                  url?: string;
                  ssl_url?: string;
                  admin_url?: string;
                  deploy_url?: string;
                  deploy_ssl_url?: string;
                  screenshot_url?: string;
                  review_id?: number;
                  draft?: boolean;
                  required?: string[];
                  required_functions?: string[];
                  error_message?: string;
                  branch?: string;
                  commit_ref?: string;
                  commit_url?: string;
                  skipped?: boolean;
                  created_at?: string;
                  updated_at?: string;
                  published_at?: string;
                  title?: string;
                  context?: string;
                  locked?: boolean;
                  review_url?: string;
                  site_capabilities?: {
                      large_media_enabled?: boolean;
                  };
                  framework?: string;
                  function_schedules?: {
                      name?: string;
                      cron?: string;
                  }[];
              };
              account_name?: string;
              account_slug?: string;
              git_provider?: string;
              deploy_hook?: string;
              capabilities?: object;
              processing_settings?: {
                  skip?: boolean;
                  css?: {
                      bundle?: boolean;
                      minify?: boolean;
                  };
                  js?: {
                      bundle?: boolean;
                      minify?: boolean;
                  };
                  images?: {
                      optimize?: boolean;
                  };
                  html?: {
                      pretty_urls?: boolean;
                  };
              };
              build_settings?: {
                  id?: number;
                  provider?: string;
                  deploy_key_id?: string;
                  repo_path?: string;
                  repo_branch?: string;
                  dir?: string;
                  functions_dir?: string;
                  cmd?: string;
                  allowed_branches?: string[];
                  public_repo?: boolean;
                  private_logs?: boolean;
                  repo_url?: string;
                  env?: object;
                  installation_id?: number;
                  stop_builds?: boolean;
              };
              id_domain?: string;
              default_hooks_data?: {
                  access_token?: string;
              };
              repo?: {
                  allowed_branches?: string[];
                  repo_url?: string;
                  env?: object;
              };
          };
          configure_dns?: boolean;
          account_slug: string;
      }"
    `)
  })

  test('render parameter with schema object', () => {
    const params: Parameter[] = [
      {
        name: 'accountAddMemberSetup',
        in: 'body',
        schema: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['Owner', 'Collaborator', 'Controller'],
            },
            email: {
              type: 'string',
            },
          },
        },
        required: true,
      },
    ]
    const node = createMethodParams(params)[0]
    expect(printNode(node)).toMatchInlineSnapshot(`
      "config: {
          role?: \\"Owner\\" | \\"Collaborator\\" | \\"Controller\\";
          email?: string;
      }"
    `)
  })

  test('render parameter with non type conform names', () => {
    const params: Parameter[] = [
      {
        name: 'file_body',
        in: 'body',
        schema: {
          type: 'string',
          format: 'binary',
        },
        required: true,
      },
      {
        name: 'X-Nf-Retry-Count',
        type: 'integer',
        in: 'header',
      },
    ]
    const node = createMethodParams(params)[0]
    expect(printNode(node)).toMatchInlineSnapshot(`
      "config: {
          file_body: string;
          \\"X-Nf-Retry-Count\\"?: number;
      }"
    `)
  })
})
