/* eslint-disable */
import { BaseAuth, type APIOptions } from './base-api.js'
export class NetlifyAPI extends BaseAuth {
  constructor(options?: APIOptions)
  constructor(accessToken: string | undefined, options?: APIOptions)
  constructor(firstArg: string | undefined | APIOptions, secondArg?: APIOptions) {
    super(firstArg, secondArg)
  }
  listSites(
    config: {
      name?: string
      filter?: 'all' | 'owner' | 'guest'
      page?: number
      per_page?: number
    } = {},
  ): Promise<ListSitesResponse> {}
  createSite(config: {
    site: {
      id?: string
      state?: string
      plan?: string
      name?: string
      custom_domain?: string
      domain_aliases?: string[]
      branch_deploy_custom_domain?: string
      deploy_preview_custom_domain?: string
      password?: string
      notification_email?: string
      url?: string
      ssl_url?: string
      admin_url?: string
      screenshot_url?: string
      created_at?: string
      updated_at?: string
      user_id?: string
      session_id?: string
      ssl?: boolean
      force_ssl?: boolean
      managed_dns?: boolean
      deploy_url?: string
      published_deploy?: {
        id?: string
        site_id?: string
        user_id?: string
        build_id?: string
        state?: string
        name?: string
        url?: string
        ssl_url?: string
        admin_url?: string
        deploy_url?: string
        deploy_ssl_url?: string
        screenshot_url?: string
        review_id?: number
        draft?: boolean
        required?: string[]
        required_functions?: string[]
        error_message?: string
        branch?: string
        commit_ref?: string
        commit_url?: string
        skipped?: boolean
        created_at?: string
        updated_at?: string
        published_at?: string
        title?: string
        context?: string
        locked?: boolean
        review_url?: string
        site_capabilities?: {
          large_media_enabled?: boolean
        }
        framework?: string
        function_schedules?: {
          name?: string
          cron?: string
        }[]
      }
      account_name?: string
      account_slug?: string
      git_provider?: string
      deploy_hook?: string
      capabilities?: object
      processing_settings?: {
        skip?: boolean
        css?: {
          bundle?: boolean
          minify?: boolean
        }
        js?: {
          bundle?: boolean
          minify?: boolean
        }
        images?: {
          optimize?: boolean
        }
        html?: {
          pretty_urls?: boolean
        }
      }
      build_settings?: {
        id?: number
        provider?: string
        deploy_key_id?: string
        repo_path?: string
        repo_branch?: string
        dir?: string
        functions_dir?: string
        cmd?: string
        allowed_branches?: string[]
        public_repo?: boolean
        private_logs?: boolean
        repo_url?: string
        env?: object
        installation_id?: number
        stop_builds?: boolean
      }
      id_domain?: string
      default_hooks_data?: {
        access_token?: string
      }
      build_image?: string
      prerender?: string
      repo?: {
        id?: number
        provider?: string
        deploy_key_id?: string
        repo_path?: string
        repo_branch?: string
        dir?: string
        functions_dir?: string
        cmd?: string
        allowed_branches?: string[]
        public_repo?: boolean
        private_logs?: boolean
        repo_url?: string
        env?: object
        installation_id?: number
        stop_builds?: boolean
      }
    }
    configure_dns?: boolean
  }): Promise<CreateSiteResponse> {}
  getSite(config: { feature_flags?: string; site_id: string }): Promise<GetSiteResponse> {}
  updateSite(config: {
    site: {
      id?: string
      state?: string
      plan?: string
      name?: string
      custom_domain?: string
      domain_aliases?: string[]
      branch_deploy_custom_domain?: string
      deploy_preview_custom_domain?: string
      password?: string
      notification_email?: string
      url?: string
      ssl_url?: string
      admin_url?: string
      screenshot_url?: string
      created_at?: string
      updated_at?: string
      user_id?: string
      session_id?: string
      ssl?: boolean
      force_ssl?: boolean
      managed_dns?: boolean
      deploy_url?: string
      published_deploy?: {
        id?: string
        site_id?: string
        user_id?: string
        build_id?: string
        state?: string
        name?: string
        url?: string
        ssl_url?: string
        admin_url?: string
        deploy_url?: string
        deploy_ssl_url?: string
        screenshot_url?: string
        review_id?: number
        draft?: boolean
        required?: string[]
        required_functions?: string[]
        error_message?: string
        branch?: string
        commit_ref?: string
        commit_url?: string
        skipped?: boolean
        created_at?: string
        updated_at?: string
        published_at?: string
        title?: string
        context?: string
        locked?: boolean
        review_url?: string
        site_capabilities?: {
          large_media_enabled?: boolean
        }
        framework?: string
        function_schedules?: {
          name?: string
          cron?: string
        }[]
      }
      account_name?: string
      account_slug?: string
      git_provider?: string
      deploy_hook?: string
      capabilities?: object
      processing_settings?: {
        skip?: boolean
        css?: {
          bundle?: boolean
          minify?: boolean
        }
        js?: {
          bundle?: boolean
          minify?: boolean
        }
        images?: {
          optimize?: boolean
        }
        html?: {
          pretty_urls?: boolean
        }
      }
      build_settings?: {
        id?: number
        provider?: string
        deploy_key_id?: string
        repo_path?: string
        repo_branch?: string
        dir?: string
        functions_dir?: string
        cmd?: string
        allowed_branches?: string[]
        public_repo?: boolean
        private_logs?: boolean
        repo_url?: string
        env?: object
        installation_id?: number
        stop_builds?: boolean
      }
      id_domain?: string
      default_hooks_data?: {
        access_token?: string
      }
      build_image?: string
      prerender?: string
      repo?: {
        id?: number
        provider?: string
        deploy_key_id?: string
        repo_path?: string
        repo_branch?: string
        dir?: string
        functions_dir?: string
        cmd?: string
        allowed_branches?: string[]
        public_repo?: boolean
        private_logs?: boolean
        repo_url?: string
        env?: object
        installation_id?: number
        stop_builds?: boolean
      }
    }
    site_id: string
  }): Promise<UpdateSiteResponse> {}
  deleteSite(config: { site_id: string }): Promise<void> {}
  provisionSiteTLSCertificate(config: {
    site_id: string
    certificate?: string
    key?: string
    ca_certificates?: string
  }): Promise<ProvisionSiteTlsCertificateResponse> {}
  showSiteTLSCertificate(config: { site_id: string }): Promise<ShowSiteTlsCertificateResponse> {}
  getEnvVars(config: {
    /** Scope response to account_id */
    account_id: string
    /** Filter by deploy context */
    context_name?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production'
    /** Filter by scope */
    scope?: 'builds' | 'functions' | 'runtime' | 'post-processing'
    /** If specified, only return environment variables set on this site */
    site_id?: string
  }): Promise<GetEnvVarsResponse> {}
  createEnvVars(config: {
    env_vars?: {
      /** The existing or new name of the key, if you wish to rename it (case-sensitive) */
      key?: string
      /** The scopes that this environment variable is set to (Pro plans and above) */
      scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
      values?: {
        /** The environment variable value's universally unique ID */
        id?: string
        /** The environment variable's unencrypted value */
        value?: string
        /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
        context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
        /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
        context_parameter?: string
      }[]
      /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
      is_secret?: boolean
    }[]
    /** Scope response to account_id */
    account_id: string
    /** If provided, create an environment variable on the site level, not the account level */
    site_id?: string
  }): Promise<CreateEnvVarsResponse> {}
  getEnvVar(config: {
    /** Scope response to account_id */
    account_id: string
    /** The environment variable key (case-sensitive) */
    key: string
    /** If provided, return the environment variable for a specific site (no merging is performed) */
    site_id?: string
  }): Promise<GetEnvVarResponse> {}
  updateEnvVar(config: {
    /** Scope response to account_id */
    account_id: string
    /** The existing environment variable key name (case-sensitive) */
    key: string
    /** The scopes that this environment variable is set to (Pro plans and above) */
    scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
    values?: {
      /** The environment variable value's universally unique ID */
      id?: string
      /** The environment variable's unencrypted value */
      value?: string
      /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
      context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
      /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
      context_parameter?: string
    }[]
    /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
    is_secret?: boolean
    /** If provided, update an environment variable set on this site */
    site_id?: string
  }): Promise<UpdateEnvVarResponse> {}
  setEnvVarValue(config: {
    /** Scope response to account_id */
    account_id: string
    /** The existing environment variable key name (case-sensitive) */
    key: string
    /** If provided, update an environment variable set on this site */
    site_id?: string
    /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. `branch` must be provided with a value in `context_parameter`. */
    context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
    /** An additional parameter for custom branches. Currently, this is used for providing a branch name when `context=branch`. */
    context_parameter?: string
    /** The environment variable's unencrypted value */
    value?: string
  }): Promise<SetEnvVarValueResponse> {}
  deleteEnvVar(config: {
    /** Scope response to account_id */
    account_id: string
    /** The environment variable key (case-sensitive) */
    key: string
    /** If provided, delete the environment variable from this site */
    site_id?: string
  }): Promise<void> {}
  deleteEnvVarValue(config: {
    /** Scope response to account_id */
    account_id: string
    /** The environment variable value's ID */
    id: string
    /** The environment variable key name (case-sensitive) */
    key: string
    /** If provided, delete the value from an environment variable on this site */
    site_id?: string
  }): Promise<void> {}
  listSiteForms(config: { site_id: string }): Promise<ListSiteFormsResponse> {}
  deleteSiteForm(config: { site_id: string; form_id: string }): Promise<void> {}
  listSiteSubmissions(config: {
    site_id: string
    page?: number
    per_page?: number
  }): Promise<ListSiteSubmissionsResponse> {}
  listSiteFiles(config: { site_id: string }): Promise<ListSiteFilesResponse> {}
  listSiteAssets(config: { site_id: string }): Promise<ListSiteAssetsResponse> {}
  createSiteAsset(config: {
    name: string
    size: number
    content_type: string
    visibility?: string
    site_id: string
  }): Promise<CreateSiteAssetResponse> {}
  getSiteAssetInfo(config: { site_id: string; asset_id: string }): Promise<GetSiteAssetInfoResponse> {}
  updateSiteAsset(config: { state: string; site_id: string; asset_id: string }): Promise<UpdateSiteAssetResponse> {}
  deleteSiteAsset(config: { site_id: string; asset_id: string }): Promise<void> {}
  getSiteAssetPublicSignature(config: {
    site_id: string
    asset_id: string
  }): Promise<GetSiteAssetPublicSignatureResponse> {}
  getSiteFileByPathName(config: { site_id: string; file_path: string }): Promise<GetSiteFileByPathNameResponse> {}
  listSiteSnippets(config: { site_id: string }): Promise<ListSiteSnippetsResponse> {}
  createSiteSnippet(config: {
    id?: number
    site_id?: string
    title?: string
    general?: string
    general_position?: string
    goal?: string
    goal_position?: string
  }): Promise<CreateSiteSnippetResponse> {}
  getSiteSnippet(config: { site_id: string; snippet_id: string }): Promise<GetSiteSnippetResponse> {}
  updateSiteSnippet(config: {
    id?: number
    site_id?: string
    title?: string
    general?: string
    general_position?: string
    goal?: string
    goal_position?: string
    snippet_id: string
  }): Promise<void> {}
  deleteSiteSnippet(config: { site_id: string; snippet_id: string }): Promise<void> {}
  getSiteMetadata(config: { site_id: string }): Promise<GetSiteMetadataResponse> {}
  updateSiteMetadata(config: { metadata: object; site_id: string }): Promise<void> {}
  listSiteBuildHooks(config: { site_id: string }): Promise<ListSiteBuildHooksResponse> {}
  createSiteBuildHook(config: {
    title?: string
    branch?: string
    site_id: string
  }): Promise<CreateSiteBuildHookResponse> {}
  getSiteBuildHook(config: { site_id: string; id: string }): Promise<GetSiteBuildHookResponse> {}
  updateSiteBuildHook(config: { title?: string; branch?: string; site_id: string; id: string }): Promise<void> {}
  deleteSiteBuildHook(config: { site_id: string; id: string }): Promise<void> {}
  listSiteDeploys(config: {
    page?: number
    per_page?: number
    site_id: string
    'deploy-previews'?: boolean
    production?: boolean
    state?:
      | 'new'
      | 'pending_review'
      | 'accepted'
      | 'rejected'
      | 'enqueued'
      | 'building'
      | 'uploading'
      | 'uploaded'
      | 'preparing'
      | 'prepared'
      | 'processing'
      | 'ready'
      | 'error'
      | 'retrying'
    branch?: string
    'latest-published'?: boolean
  }): Promise<ListSiteDeploysResponse> {}
  createSiteDeploy(config: {
    title?: string
    files?: object
    draft?: boolean
    async?: boolean
    functions?: object
    function_schedules?: {
      name?: string
      cron?: string
    }[]
    functions_config?: object
    branch?: string
    framework?: string
    site_id: string
    'deploy-previews'?: boolean
    production?: boolean
    state?:
      | 'new'
      | 'pending_review'
      | 'accepted'
      | 'rejected'
      | 'enqueued'
      | 'building'
      | 'uploading'
      | 'uploaded'
      | 'preparing'
      | 'prepared'
      | 'processing'
      | 'ready'
      | 'error'
      | 'retrying'
    'latest-published'?: boolean
  }): Promise<CreateSiteDeployResponse> {}
  getSiteDeploy(config: { site_id: string; deploy_id: string }): Promise<GetSiteDeployResponse> {}
  updateSiteDeploy(config: {
    site_id: string
    deploy_id: string
    files?: object
    draft?: boolean
    async?: boolean
    functions?: object
    function_schedules?: {
      name?: string
      cron?: string
    }[]
    functions_config?: object
    branch?: string
    framework?: string
  }): Promise<UpdateSiteDeployResponse> {}
  deleteSiteDeploy(config: { deploy_id: string; site_id: string }): Promise<void> {}
  cancelSiteDeploy(config: { deploy_id: string }): Promise<CancelSiteDeployResponse> {}
  restoreSiteDeploy(config: { site_id: string; deploy_id: string }): Promise<RestoreSiteDeployResponse> {}
  listSiteBuilds(config: { page?: number; per_page?: number; site_id: string }): Promise<ListSiteBuildsResponse> {}
  createSiteBuild(config: {
    image?: string
    clear_cache?: boolean
    site_id: string
  }): Promise<CreateSiteBuildResponse> {}
  listSiteDeployedBranches(config: { site_id: string }): Promise<ListSiteDeployedBranchesResponse> {}
  unlinkSiteRepo(config: { site_id: string }): Promise<UnlinkSiteRepoResponse> {}
  getSiteBuild(config: { build_id: string }): Promise<GetSiteBuildResponse> {}
  updateSiteBuildLog(config: {
    build_id: string
    message?: string
    error?: boolean
    section?: 'initializing' | 'building' | 'deploying' | 'cleanup' | 'postprocessing'
  }): Promise<void> {}
  notifyBuildStart(config: { build_id: string }): Promise<void> {}
  getAccountBuildStatus(config: { account_id: string }): Promise<GetAccountBuildStatusResponse> {}
  getDNSForSite(config: { site_id: string }): Promise<GetDnsForSiteResponse> {}
  configureDNSForSite(config: { site_id: string }): Promise<ConfigureDnsForSiteResponse> {}
  rollbackSiteDeploy(config: { site_id: string }): Promise<void> {}
  getDeploy(config: { deploy_id: string }): Promise<GetDeployResponse> {}
  deleteDeploy(config: { deploy_id: string }): Promise<void> {}
  lockDeploy(config: { deploy_id: string }): Promise<LockDeployResponse> {}
  unlockDeploy(config: { deploy_id: string }): Promise<UnlockDeployResponse> {}
  uploadDeployFile(config: {
    deploy_id: string
    path: string
    size?: number
    file_body: string
  }): Promise<UploadDeployFileResponse> {}
  uploadDeployFunction(config: {
    deploy_id: string
    name: string
    runtime?: string
    invocation_mode?: string
    size?: number
    file_body: string
    'X-Nf-Retry-Count'?: number
  }): Promise<UploadDeployFunctionResponse> {}
  updatePlugin(config: { site_id: string; package: string; pinned_version?: string }): Promise<UpdatePluginResponse> {}
  getLatestPluginRuns(config: { site_id: string; packages: string[]; state?: string }): Promise<void> {}
  createPluginRun(config: {
    deploy_id: string
    package?: string
    version?: string
    state?: string
    reporting_event?: string
    title?: string
    summary?: string
    text?: string
  }): Promise<CreatePluginRunResponse> {}
  listFormSubmissions(config: {
    form_id: string
    page?: number
    per_page?: number
  }): Promise<ListFormSubmissionsResponse> {}
  listHooksBySiteId(config: { site_id: string }): Promise<ListHooksBySiteIdResponse> {}
  createHookBySiteId(config: {
    site_id: string
    id?: string
    type?: string
    event?: string
    data?: object
    created_at?: string
    updated_at?: string
    disabled?: boolean
  }): Promise<CreateHookBySiteIdResponse> {}
  getHook(config: { hook_id: string }): Promise<GetHookResponse> {}
  updateHook(config: {
    id?: string
    site_id?: string
    type?: string
    event?: string
    data?: object
    created_at?: string
    updated_at?: string
    disabled?: boolean
    hook_id: string
  }): Promise<UpdateHookResponse> {}
  deleteHook(config: { hook_id: string }): Promise<void> {}
  enableHook(config: { hook_id: string }): Promise<EnableHookResponse> {}
  listHookTypes(): Promise<ListHookTypesResponse> {}
  createTicket(config: { client_id: string }): Promise<CreateTicketResponse> {}
  showTicket(config: { ticket_id: string }): Promise<ShowTicketResponse> {}
  exchangeTicket(config: { ticket_id: string }): Promise<ExchangeTicketResponse> {}
  listDeployKeys(): Promise<ListDeployKeysResponse> {}
  createDeployKey(): Promise<CreateDeployKeyResponse> {}
  getDeployKey(config: { key_id: string }): Promise<GetDeployKeyResponse> {}
  deleteDeployKey(config: { key_id: string }): Promise<void> {}
  createSiteInTeam(config: {
    site?: {
      id?: string
      state?: string
      plan?: string
      name?: string
      custom_domain?: string
      domain_aliases?: string[]
      branch_deploy_custom_domain?: string
      deploy_preview_custom_domain?: string
      password?: string
      notification_email?: string
      url?: string
      ssl_url?: string
      admin_url?: string
      screenshot_url?: string
      created_at?: string
      updated_at?: string
      user_id?: string
      session_id?: string
      ssl?: boolean
      force_ssl?: boolean
      managed_dns?: boolean
      deploy_url?: string
      published_deploy?: {
        id?: string
        site_id?: string
        user_id?: string
        build_id?: string
        state?: string
        name?: string
        url?: string
        ssl_url?: string
        admin_url?: string
        deploy_url?: string
        deploy_ssl_url?: string
        screenshot_url?: string
        review_id?: number
        draft?: boolean
        required?: string[]
        required_functions?: string[]
        error_message?: string
        branch?: string
        commit_ref?: string
        commit_url?: string
        skipped?: boolean
        created_at?: string
        updated_at?: string
        published_at?: string
        title?: string
        context?: string
        locked?: boolean
        review_url?: string
        site_capabilities?: {
          large_media_enabled?: boolean
        }
        framework?: string
        function_schedules?: {
          name?: string
          cron?: string
        }[]
      }
      account_name?: string
      account_slug?: string
      git_provider?: string
      deploy_hook?: string
      capabilities?: object
      processing_settings?: {
        skip?: boolean
        css?: {
          bundle?: boolean
          minify?: boolean
        }
        js?: {
          bundle?: boolean
          minify?: boolean
        }
        images?: {
          optimize?: boolean
        }
        html?: {
          pretty_urls?: boolean
        }
      }
      build_settings?: {
        id?: number
        provider?: string
        deploy_key_id?: string
        repo_path?: string
        repo_branch?: string
        dir?: string
        functions_dir?: string
        cmd?: string
        allowed_branches?: string[]
        public_repo?: boolean
        private_logs?: boolean
        repo_url?: string
        env?: object
        installation_id?: number
        stop_builds?: boolean
      }
      id_domain?: string
      default_hooks_data?: {
        access_token?: string
      }
      build_image?: string
      prerender?: string
      repo?: {
        id?: number
        provider?: string
        deploy_key_id?: string
        repo_path?: string
        repo_branch?: string
        dir?: string
        functions_dir?: string
        cmd?: string
        allowed_branches?: string[]
        public_repo?: boolean
        private_logs?: boolean
        repo_url?: string
        env?: object
        installation_id?: number
        stop_builds?: boolean
      }
    }
    configure_dns?: boolean
    account_slug: string
  }): Promise<CreateSiteInTeamResponse> {}
  listSitesForAccount(config: {
    name?: string
    account_slug: string
    page?: number
    per_page?: number
  }): Promise<ListSitesForAccountResponse> {}
  listMembersForAccount(config: { account_slug: string }): Promise<ListMembersForAccountResponse> {}
  addMemberToAccount(config: {
    role?: 'Owner' | 'Collaborator' | 'Controller'
    email?: string
    account_slug: string
  }): Promise<AddMemberToAccountResponse> {}
  getAccountMember(config: { account_slug: string; member_id: string }): Promise<GetAccountMemberResponse> {}
  updateAccountMember(config: {
    role?: 'Owner' | 'Collaborator' | 'Controller'
    site_access?: 'all' | 'none' | 'selected'
    site_ids?: string[]
    account_slug: string
    member_id: string
  }): Promise<UpdateAccountMemberResponse> {}
  removeAccountMember(config: { account_slug: string; member_id: string }): Promise<void> {}
  listPaymentMethodsForUser(): Promise<ListPaymentMethodsForUserResponse> {}
  listAccountTypesForUser(): Promise<ListAccountTypesForUserResponse> {}
  listAccountsForUser(): Promise<ListAccountsForUserResponse> {}
  createAccount(config: {
    name?: string
    type_id?: string
    payment_method_id?: string
    period?: 'monthly' | 'yearly'
    extra_seats_block?: number
  }): Promise<CreateAccountResponse> {}
  getAccount(config: { account_id: string }): Promise<GetAccountResponse> {}
  updateAccount(config: {
    name?: string
    slug?: string
    type_id?: string
    extra_seats_block?: number
    billing_name?: string
    billing_email?: string
    billing_details?: string
    account_id: string
  }): Promise<UpdateAccountResponse> {}
  cancelAccount(config: { account_id: string }): Promise<void> {}
  listAccountAuditEvents(config: {
    query?: string
    log_type?: string
    page?: number
    per_page?: number
    account_id: string
  }): Promise<ListAccountAuditEventsResponse> {}
  listFormSubmission(config: {
    query?: string
    page?: number
    per_page?: number
    submission_id: string
  }): Promise<ListFormSubmissionResponse> {}
  deleteSubmission(config: { submission_id: string }): Promise<void> {}
  listServiceInstancesForSite(config: { site_id: string }): Promise<ListServiceInstancesForSiteResponse> {}
  createServiceInstance(config: {
    config: object
    site_id: string
    addon: string
  }): Promise<CreateServiceInstanceResponse> {}
  showServiceInstance(config: {
    site_id: string
    addon: string
    instance_id: string
  }): Promise<ShowServiceInstanceResponse> {}
  updateServiceInstance(config: {
    config: object
    site_id: string
    addon: string
    instance_id: string
  }): Promise<void> {}
  deleteServiceInstance(config: { site_id: string; addon: string; instance_id: string }): Promise<void> {}
  getServices(
    config: {
      search?: string
    } = {},
  ): Promise<GetServicesResponse> {}
  showService(config: { addonName: string }): Promise<ShowServiceResponse> {}
  showServiceManifest(config: { addonName: string }): Promise<ShowServiceManifestResponse> {}
  getCurrentUser(): Promise<GetCurrentUserResponse> {}
  createSplitTest(config: { branch_tests?: object; site_id: string }): Promise<CreateSplitTestResponse> {}
  getSplitTests(config: { site_id: string }): Promise<GetSplitTestsResponse> {}
  updateSplitTest(config: {
    branch_tests?: object
    site_id: string
    split_test_id: string
  }): Promise<UpdateSplitTestResponse> {}
  getSplitTest(config: { site_id: string; split_test_id: string }): Promise<GetSplitTestResponse> {}
  enableSplitTest(config: { site_id: string; split_test_id: string }): Promise<void> {}
  disableSplitTest(config: { site_id: string; split_test_id: string }): Promise<void> {}
  createDnsZone(config: { account_slug?: string; site_id?: string; name?: string }): Promise<CreateDnsZoneResponse> {}
  getDnsZones(
    config: {
      account_slug?: string
    } = {},
  ): Promise<GetDnsZonesResponse> {}
  getDnsZone(config: { zone_id: string }): Promise<GetDnsZoneResponse> {}
  deleteDnsZone(config: { zone_id: string }): Promise<void> {}
  transferDnsZone(config: {
    zone_id: string
    /** the account of the dns zone */
    account_id: string
    /** the account you want to transfer the dns zone to */
    transfer_account_id: string
    /** the user you want to transfer the dns zone to */
    transfer_user_id: string
  }): Promise<TransferDnsZoneResponse> {}
  getDnsRecords(config: { zone_id: string }): Promise<GetDnsRecordsResponse> {}
  createDnsRecord(config: {
    type?: string
    hostname?: string
    value?: string
    ttl?: number
    priority?: number
    weight?: number
    port?: number
    flag?: number
    tag?: string
    zone_id: string
  }): Promise<CreateDnsRecordResponse> {}
  getIndividualDnsRecord(config: { zone_id: string; dns_record_id: string }): Promise<GetIndividualDnsRecordResponse> {}
  deleteDnsRecord(config: { zone_id: string; dns_record_id: string }): Promise<void> {}
}
export type ListSitesResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}[]
export type CreateSiteResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}
export type GetSiteResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}
export type UpdateSiteResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}
export type ProvisionSiteTlsCertificateResponse = {
  state?: string
  domains?: string[]
  created_at?: string
  updated_at?: string
  expires_at?: string
}
export type ShowSiteTlsCertificateResponse = {
  state?: string
  domains?: string[]
  created_at?: string
  updated_at?: string
  expires_at?: string
}
export type GetEnvVarsResponse = {
  /** The environment variable key, like ALGOLIA_ID (case-sensitive) */
  key?: string
  /** The scopes that this environment variable is set to */
  scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
  /** An array of Value objects containing values and metadata */
  values?: {
    /** The environment variable value's universally unique ID */
    id?: string
    /** The environment variable's unencrypted value */
    value?: string
    /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
    context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
    /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
    context_parameter?: string
  }[]
  /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
  is_secret?: boolean
  /** The timestamp of when the value was last updated */
  updated_at?: string
  updated_by?: {
    /** The user's unique identifier */
    id?: string
    /** The user's full name (first and last) */
    full_name?: string
    /** The user's email address */
    email?: string
    /** A URL pointing to the user's avatar */
    avatar_url?: string
  }
}[]
export type CreateEnvVarsResponse = {
  /** The environment variable key, like ALGOLIA_ID (case-sensitive) */
  key?: string
  /** The scopes that this environment variable is set to */
  scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
  /** An array of Value objects containing values and metadata */
  values?: {
    /** The environment variable value's universally unique ID */
    id?: string
    /** The environment variable's unencrypted value */
    value?: string
    /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
    context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
    /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
    context_parameter?: string
  }[]
  /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
  is_secret?: boolean
  /** The timestamp of when the value was last updated */
  updated_at?: string
  updated_by?: {
    /** The user's unique identifier */
    id?: string
    /** The user's full name (first and last) */
    full_name?: string
    /** The user's email address */
    email?: string
    /** A URL pointing to the user's avatar */
    avatar_url?: string
  }
}[]
export type GetEnvVarResponse = {
  /** The environment variable key, like ALGOLIA_ID (case-sensitive) */
  key?: string
  /** The scopes that this environment variable is set to */
  scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
  /** An array of Value objects containing values and metadata */
  values?: {
    /** The environment variable value's universally unique ID */
    id?: string
    /** The environment variable's unencrypted value */
    value?: string
    /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
    context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
    /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
    context_parameter?: string
  }[]
  /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
  is_secret?: boolean
  /** The timestamp of when the value was last updated */
  updated_at?: string
  updated_by?: {
    /** The user's unique identifier */
    id?: string
    /** The user's full name (first and last) */
    full_name?: string
    /** The user's email address */
    email?: string
    /** A URL pointing to the user's avatar */
    avatar_url?: string
  }
}
export type UpdateEnvVarResponse = {
  /** The environment variable key, like ALGOLIA_ID (case-sensitive) */
  key?: string
  /** The scopes that this environment variable is set to */
  scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
  /** An array of Value objects containing values and metadata */
  values?: {
    /** The environment variable value's universally unique ID */
    id?: string
    /** The environment variable's unencrypted value */
    value?: string
    /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
    context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
    /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
    context_parameter?: string
  }[]
  /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
  is_secret?: boolean
  /** The timestamp of when the value was last updated */
  updated_at?: string
  updated_by?: {
    /** The user's unique identifier */
    id?: string
    /** The user's full name (first and last) */
    full_name?: string
    /** The user's email address */
    email?: string
    /** A URL pointing to the user's avatar */
    avatar_url?: string
  }
}
export type SetEnvVarValueResponse = {
  /** The environment variable key, like ALGOLIA_ID (case-sensitive) */
  key?: string
  /** The scopes that this environment variable is set to */
  scopes?: ('builds' | 'functions' | 'runtime' | 'post-processing')[]
  /** An array of Value objects containing values and metadata */
  values?: {
    /** The environment variable value's universally unique ID */
    id?: string
    /** The environment variable's unencrypted value */
    value?: string
    /** The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. */
    context?: 'all' | 'dev' | 'branch-deploy' | 'deploy-preview' | 'production' | 'branch'
    /** An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`. */
    context_parameter?: string
  }[]
  /** Secret values are only readable by code running on Netlify’s systems.  With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret. (Enterprise plans only) */
  is_secret?: boolean
  /** The timestamp of when the value was last updated */
  updated_at?: string
  updated_by?: {
    /** The user's unique identifier */
    id?: string
    /** The user's full name (first and last) */
    full_name?: string
    /** The user's email address */
    email?: string
    /** A URL pointing to the user's avatar */
    avatar_url?: string
  }
}
export type ListSiteFormsResponse = {
  id?: string
  site_id?: string
  name?: string
  paths?: string[]
  submission_count?: number
  fields?: object[]
  created_at?: string
}[]
export type ListSiteSubmissionsResponse = {
  id?: string
  number?: number
  email?: string
  name?: string
  first_name?: string
  last_name?: string
  company?: string
  summary?: string
  body?: string
  data?: object
  created_at?: string
  site_url?: string
}[]
export type ListSiteFilesResponse = {
  id?: string
  path?: string
  sha?: string
  mime_type?: string
  size?: number
}[]
export type ListSiteAssetsResponse = {
  id?: string
  site_id?: string
  creator_id?: string
  name?: string
  state?: string
  content_type?: string
  url?: string
  key?: string
  visibility?: string
  size?: number
  created_at?: string
  updated_at?: string
}[]
export type CreateSiteAssetResponse = {
  form?: {
    url?: string
    fields?: object
  }
  asset?: {
    id?: string
    site_id?: string
    creator_id?: string
    name?: string
    state?: string
    content_type?: string
    url?: string
    key?: string
    visibility?: string
    size?: number
    created_at?: string
    updated_at?: string
  }
}
export type GetSiteAssetInfoResponse = {
  id?: string
  site_id?: string
  creator_id?: string
  name?: string
  state?: string
  content_type?: string
  url?: string
  key?: string
  visibility?: string
  size?: number
  created_at?: string
  updated_at?: string
}
export type UpdateSiteAssetResponse = {
  id?: string
  site_id?: string
  creator_id?: string
  name?: string
  state?: string
  content_type?: string
  url?: string
  key?: string
  visibility?: string
  size?: number
  created_at?: string
  updated_at?: string
}
export type GetSiteAssetPublicSignatureResponse = {
  url?: string
}
export type GetSiteFileByPathNameResponse = {
  id?: string
  path?: string
  sha?: string
  mime_type?: string
  size?: number
}
export type ListSiteSnippetsResponse = {
  id?: number
  site_id?: string
  title?: string
  general?: string
  general_position?: string
  goal?: string
  goal_position?: string
}[]
export type CreateSiteSnippetResponse = {
  id?: number
  site_id?: string
  title?: string
  general?: string
  general_position?: string
  goal?: string
  goal_position?: string
}
export type GetSiteSnippetResponse = {
  id?: number
  site_id?: string
  title?: string
  general?: string
  general_position?: string
  goal?: string
  goal_position?: string
}
export type GetSiteMetadataResponse = object
export type ListSiteBuildHooksResponse = {
  id?: string
  title?: string
  branch?: string
  url?: string
  site_id?: string
  created_at?: string
}[]
export type CreateSiteBuildHookResponse = {
  id?: string
  title?: string
  branch?: string
  url?: string
  site_id?: string
  created_at?: string
}
export type GetSiteBuildHookResponse = {
  id?: string
  title?: string
  branch?: string
  url?: string
  site_id?: string
  created_at?: string
}
export type ListSiteDeploysResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}[]
export type CreateSiteDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type GetSiteDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type UpdateSiteDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type CancelSiteDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type RestoreSiteDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type ListSiteBuildsResponse = {
  id?: string
  deploy_id?: string
  sha?: string
  done?: boolean
  error?: string
  created_at?: string
}[]
export type CreateSiteBuildResponse = {
  id?: string
  deploy_id?: string
  sha?: string
  done?: boolean
  error?: string
  created_at?: string
}
export type ListSiteDeployedBranchesResponse = {
  id?: string
  deploy_id?: string
  name?: string
  slug?: string
  url?: string
  ssl_url?: string
}[]
export type UnlinkSiteRepoResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}
export type GetSiteBuildResponse = {
  id?: string
  deploy_id?: string
  sha?: string
  done?: boolean
  error?: string
  created_at?: string
}
export type GetAccountBuildStatusResponse = {
  active?: number
  pending_concurrency?: number
  enqueued?: number
  build_count?: number
  minutes?: {
    current?: number
    current_average_sec?: number
    previous?: number
    period_start_date?: string
    period_end_date?: string
    last_updated_at?: string
    included_minutes?: string
    included_minutes_with_packs?: string
  }
}[]
export type GetDnsForSiteResponse = {
  id?: string
  name?: string
  errors?: string[]
  supported_record_types?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  records?: {
    id?: string
    hostname?: string
    type?: string
    value?: string
    ttl?: number
    priority?: number
    dns_zone_id?: string
    site_id?: string
    flag?: number
    tag?: string
    managed?: boolean
  }[]
  dns_servers?: string[]
  account_id?: string
  site_id?: string
  account_slug?: string
  account_name?: string
  domain?: string
  ipv6_enabled?: boolean
  dedicated?: boolean
}[]
export type ConfigureDnsForSiteResponse = {
  id?: string
  name?: string
  errors?: string[]
  supported_record_types?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  records?: {
    id?: string
    hostname?: string
    type?: string
    value?: string
    ttl?: number
    priority?: number
    dns_zone_id?: string
    site_id?: string
    flag?: number
    tag?: string
    managed?: boolean
  }[]
  dns_servers?: string[]
  account_id?: string
  site_id?: string
  account_slug?: string
  account_name?: string
  domain?: string
  ipv6_enabled?: boolean
  dedicated?: boolean
}[]
export type GetDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type LockDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type UnlockDeployResponse = {
  id?: string
  site_id?: string
  user_id?: string
  build_id?: string
  state?: string
  name?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  screenshot_url?: string
  review_id?: number
  draft?: boolean
  required?: string[]
  required_functions?: string[]
  error_message?: string
  branch?: string
  commit_ref?: string
  commit_url?: string
  skipped?: boolean
  created_at?: string
  updated_at?: string
  published_at?: string
  title?: string
  context?: string
  locked?: boolean
  review_url?: string
  site_capabilities?: {
    large_media_enabled?: boolean
  }
  framework?: string
  function_schedules?: {
    name?: string
    cron?: string
  }[]
}
export type UploadDeployFileResponse = {
  id?: string
  path?: string
  sha?: string
  mime_type?: string
  size?: number
}
export type UploadDeployFunctionResponse = {
  id?: string
  name?: string
  sha?: string
}
export type UpdatePluginResponse = {
  package?: string
  pinned_version?: string
}
export type CreatePluginRunResponse = {
  package?: string
  version?: string
  state?: string
  reporting_event?: string
  title?: string
  summary?: string
  text?: string
  deploy_id?: string
}
export type ListFormSubmissionsResponse = {
  id?: string
  number?: number
  email?: string
  name?: string
  first_name?: string
  last_name?: string
  company?: string
  summary?: string
  body?: string
  data?: object
  created_at?: string
  site_url?: string
}[]
export type ListHooksBySiteIdResponse = {
  id?: string
  site_id?: string
  type?: string
  event?: string
  data?: object
  created_at?: string
  updated_at?: string
  disabled?: boolean
}[]
export type CreateHookBySiteIdResponse = {
  id?: string
  site_id?: string
  type?: string
  event?: string
  data?: object
  created_at?: string
  updated_at?: string
  disabled?: boolean
}
export type GetHookResponse = {
  id?: string
  site_id?: string
  type?: string
  event?: string
  data?: object
  created_at?: string
  updated_at?: string
  disabled?: boolean
}
export type UpdateHookResponse = {
  id?: string
  site_id?: string
  type?: string
  event?: string
  data?: object
  created_at?: string
  updated_at?: string
  disabled?: boolean
}
export type EnableHookResponse = {
  id?: string
  site_id?: string
  type?: string
  event?: string
  data?: object
  created_at?: string
  updated_at?: string
  disabled?: boolean
}
export type ListHookTypesResponse = {
  name?: string
  events?: string[]
  fields?: object[]
}[]
export type CreateTicketResponse = {
  id?: string
  client_id?: string
  authorized?: boolean
  created_at?: string
}
export type ShowTicketResponse = {
  id?: string
  client_id?: string
  authorized?: boolean
  created_at?: string
}
export type ExchangeTicketResponse = {
  id?: string
  access_token?: string
  user_id?: string
  user_email?: string
  created_at?: string
}
export type ListDeployKeysResponse = {
  id?: string
  public_key?: string
  created_at?: string
}[]
export type CreateDeployKeyResponse = {
  id?: string
  public_key?: string
  created_at?: string
}
export type GetDeployKeyResponse = {
  id?: string
  public_key?: string
  created_at?: string
}
export type CreateSiteInTeamResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}
export type ListSitesForAccountResponse = {
  id?: string
  state?: string
  plan?: string
  name?: string
  custom_domain?: string
  domain_aliases?: string[]
  branch_deploy_custom_domain?: string
  deploy_preview_custom_domain?: string
  password?: string
  notification_email?: string
  url?: string
  ssl_url?: string
  admin_url?: string
  screenshot_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  session_id?: string
  ssl?: boolean
  force_ssl?: boolean
  managed_dns?: boolean
  deploy_url?: string
  published_deploy?: {
    id?: string
    site_id?: string
    user_id?: string
    build_id?: string
    state?: string
    name?: string
    url?: string
    ssl_url?: string
    admin_url?: string
    deploy_url?: string
    deploy_ssl_url?: string
    screenshot_url?: string
    review_id?: number
    draft?: boolean
    required?: string[]
    required_functions?: string[]
    error_message?: string
    branch?: string
    commit_ref?: string
    commit_url?: string
    skipped?: boolean
    created_at?: string
    updated_at?: string
    published_at?: string
    title?: string
    context?: string
    locked?: boolean
    review_url?: string
    site_capabilities?: {
      large_media_enabled?: boolean
    }
    framework?: string
    function_schedules?: {
      name?: string
      cron?: string
    }[]
  }
  account_name?: string
  account_slug?: string
  git_provider?: string
  deploy_hook?: string
  capabilities?: object
  processing_settings?: {
    skip?: boolean
    css?: {
      bundle?: boolean
      minify?: boolean
    }
    js?: {
      bundle?: boolean
      minify?: boolean
    }
    images?: {
      optimize?: boolean
    }
    html?: {
      pretty_urls?: boolean
    }
  }
  build_settings?: {
    id?: number
    provider?: string
    deploy_key_id?: string
    repo_path?: string
    repo_branch?: string
    dir?: string
    functions_dir?: string
    cmd?: string
    allowed_branches?: string[]
    public_repo?: boolean
    private_logs?: boolean
    repo_url?: string
    env?: object
    installation_id?: number
    stop_builds?: boolean
  }
  id_domain?: string
  default_hooks_data?: {
    access_token?: string
  }
  build_image?: string
  prerender?: string
}[]
export type ListMembersForAccountResponse = {
  id?: string
  full_name?: string
  email?: string
  avatar?: string
  role?: string
}[]
export type AddMemberToAccountResponse = {
  id?: string
  full_name?: string
  email?: string
  avatar?: string
  role?: string
}[]
export type GetAccountMemberResponse = {
  id?: string
  full_name?: string
  email?: string
  avatar?: string
  role?: string
}
export type UpdateAccountMemberResponse = {
  id?: string
  full_name?: string
  email?: string
  avatar?: string
  role?: string
}
export type ListPaymentMethodsForUserResponse = {
  id?: string
  method_name?: string
  type?: string
  state?: string
  data?: {
    card_type?: string
    last4?: string
    email?: string
  }
  created_at?: string
  updated_at?: string
}[]
export type ListAccountTypesForUserResponse = {
  id?: string
  name?: string
  description?: string
  capabilities?: object
  monthly_dollar_price?: number
  yearly_dollar_price?: number
  monthly_seats_addon_dollar_price?: number
  yearly_seats_addon_dollar_price?: number
}[]
export type ListAccountsForUserResponse = {
  id?: string
  name?: string
  slug?: string
  type?: string
  capabilities?: {
    sites?: {
      included?: number
      used?: number
    }
    collaborators?: {
      included?: number
      used?: number
    }
  }
  billing_name?: string
  billing_email?: string
  billing_details?: string
  billing_period?: string
  payment_method_id?: string
  type_name?: string
  type_id?: string
  owner_ids?: string[]
  roles_allowed?: string[]
  created_at?: string
  updated_at?: string
}[]
export type CreateAccountResponse = {
  id?: string
  name?: string
  slug?: string
  type?: string
  capabilities?: {
    sites?: {
      included?: number
      used?: number
    }
    collaborators?: {
      included?: number
      used?: number
    }
  }
  billing_name?: string
  billing_email?: string
  billing_details?: string
  billing_period?: string
  payment_method_id?: string
  type_name?: string
  type_id?: string
  owner_ids?: string[]
  roles_allowed?: string[]
  created_at?: string
  updated_at?: string
}
export type GetAccountResponse = {
  id?: string
  name?: string
  slug?: string
  type?: string
  capabilities?: {
    sites?: {
      included?: number
      used?: number
    }
    collaborators?: {
      included?: number
      used?: number
    }
  }
  billing_name?: string
  billing_email?: string
  billing_details?: string
  billing_period?: string
  payment_method_id?: string
  type_name?: string
  type_id?: string
  owner_ids?: string[]
  roles_allowed?: string[]
  created_at?: string
  updated_at?: string
}[]
export type UpdateAccountResponse = {
  id?: string
  name?: string
  slug?: string
  type?: string
  capabilities?: {
    sites?: {
      included?: number
      used?: number
    }
    collaborators?: {
      included?: number
      used?: number
    }
  }
  billing_name?: string
  billing_email?: string
  billing_details?: string
  billing_period?: string
  payment_method_id?: string
  type_name?: string
  type_id?: string
  owner_ids?: string[]
  roles_allowed?: string[]
  created_at?: string
  updated_at?: string
}
export type ListAccountAuditEventsResponse = {
  id?: string
  account_id?: string
  payload?: {
    actor_id?: string
    actor_name?: string
    actor_email?: string
    action?: string
    timestamp?: string
    log_type?: string
  }
}[]
export type ListFormSubmissionResponse = {
  id?: string
  number?: number
  email?: string
  name?: string
  first_name?: string
  last_name?: string
  company?: string
  summary?: string
  body?: string
  data?: object
  created_at?: string
  site_url?: string
}[]
export type ListServiceInstancesForSiteResponse = {
  id?: string
  url?: string
  config?: object
  external_attributes?: object
  service_slug?: string
  service_path?: string
  service_name?: string
  env?: object
  snippets?: object[]
  auth_url?: string
  created_at?: string
  updated_at?: string
}[]
export type CreateServiceInstanceResponse = {
  id?: string
  url?: string
  config?: object
  external_attributes?: object
  service_slug?: string
  service_path?: string
  service_name?: string
  env?: object
  snippets?: object[]
  auth_url?: string
  created_at?: string
  updated_at?: string
}
export type ShowServiceInstanceResponse = {
  id?: string
  url?: string
  config?: object
  external_attributes?: object
  service_slug?: string
  service_path?: string
  service_name?: string
  env?: object
  snippets?: object[]
  auth_url?: string
  created_at?: string
  updated_at?: string
}
export type GetServicesResponse = {
  id?: string
  name?: string
  slug?: string
  service_path?: string
  long_description?: string
  description?: string
  events?: object[]
  tags?: string[]
  icon?: string
  manifest_url?: string
  environments?: string[]
  created_at?: string
  updated_at?: string
}[]
export type ShowServiceResponse = {
  id?: string
  name?: string
  slug?: string
  service_path?: string
  long_description?: string
  description?: string
  events?: object[]
  tags?: string[]
  icon?: string
  manifest_url?: string
  environments?: string[]
  created_at?: string
  updated_at?: string
}
export type ShowServiceManifestResponse = object
export type GetCurrentUserResponse = {
  id?: string
  uid?: string
  full_name?: string
  avatar_url?: string
  email?: string
  affiliate_id?: string
  site_count?: number
  created_at?: string
  last_login?: string
  login_providers?: string[]
  onboarding_progress?: {
    slides?: string
  }
}[]
export type CreateSplitTestResponse = {
  id?: string
  site_id?: string
  name?: string
  path?: string
  branches?: object[]
  active?: boolean
  created_at?: string
  updated_at?: string
  unpublished_at?: string
}
export type GetSplitTestsResponse = {
  id?: string
  site_id?: string
  name?: string
  path?: string
  branches?: object[]
  active?: boolean
  created_at?: string
  updated_at?: string
  unpublished_at?: string
}[]
export type UpdateSplitTestResponse = {
  id?: string
  site_id?: string
  name?: string
  path?: string
  branches?: object[]
  active?: boolean
  created_at?: string
  updated_at?: string
  unpublished_at?: string
}
export type GetSplitTestResponse = {
  id?: string
  site_id?: string
  name?: string
  path?: string
  branches?: object[]
  active?: boolean
  created_at?: string
  updated_at?: string
  unpublished_at?: string
}
export type CreateDnsZoneResponse = {
  id?: string
  name?: string
  errors?: string[]
  supported_record_types?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  records?: {
    id?: string
    hostname?: string
    type?: string
    value?: string
    ttl?: number
    priority?: number
    dns_zone_id?: string
    site_id?: string
    flag?: number
    tag?: string
    managed?: boolean
  }[]
  dns_servers?: string[]
  account_id?: string
  site_id?: string
  account_slug?: string
  account_name?: string
  domain?: string
  ipv6_enabled?: boolean
  dedicated?: boolean
}
export type GetDnsZonesResponse = {
  id?: string
  name?: string
  errors?: string[]
  supported_record_types?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  records?: {
    id?: string
    hostname?: string
    type?: string
    value?: string
    ttl?: number
    priority?: number
    dns_zone_id?: string
    site_id?: string
    flag?: number
    tag?: string
    managed?: boolean
  }[]
  dns_servers?: string[]
  account_id?: string
  site_id?: string
  account_slug?: string
  account_name?: string
  domain?: string
  ipv6_enabled?: boolean
  dedicated?: boolean
}[]
export type GetDnsZoneResponse = {
  id?: string
  name?: string
  errors?: string[]
  supported_record_types?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  records?: {
    id?: string
    hostname?: string
    type?: string
    value?: string
    ttl?: number
    priority?: number
    dns_zone_id?: string
    site_id?: string
    flag?: number
    tag?: string
    managed?: boolean
  }[]
  dns_servers?: string[]
  account_id?: string
  site_id?: string
  account_slug?: string
  account_name?: string
  domain?: string
  ipv6_enabled?: boolean
  dedicated?: boolean
}
export type TransferDnsZoneResponse = {
  id?: string
  name?: string
  errors?: string[]
  supported_record_types?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  records?: {
    id?: string
    hostname?: string
    type?: string
    value?: string
    ttl?: number
    priority?: number
    dns_zone_id?: string
    site_id?: string
    flag?: number
    tag?: string
    managed?: boolean
  }[]
  dns_servers?: string[]
  account_id?: string
  site_id?: string
  account_slug?: string
  account_name?: string
  domain?: string
  ipv6_enabled?: boolean
  dedicated?: boolean
}
export type GetDnsRecordsResponse = {
  id?: string
  hostname?: string
  type?: string
  value?: string
  ttl?: number
  priority?: number
  dns_zone_id?: string
  site_id?: string
  flag?: number
  tag?: string
  managed?: boolean
}[]
export type CreateDnsRecordResponse = {
  id?: string
  hostname?: string
  type?: string
  value?: string
  ttl?: number
  priority?: number
  dns_zone_id?: string
  site_id?: string
  flag?: number
  tag?: string
  managed?: boolean
}
export type GetIndividualDnsRecordResponse = {
  id?: string
  hostname?: string
  type?: string
  value?: string
  ttl?: number
  priority?: number
  dns_zone_id?: string
  site_id?: string
  flag?: number
  tag?: string
  managed?: boolean
}
