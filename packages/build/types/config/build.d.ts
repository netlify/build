/* eslint-disable camelcase -- some properties are named in snake case in this API */

export interface Build {
  /**
   * Includes a site's [build command](https://docs.netlify.com/configure-builds/get-started/#definitions)
   */
  command?: string

  /**
   * the path to your static content folder
   */
  publish: string
  base: string
  services: Record<string, unknown>

  /**
   * Allows specifying a Bash command that will be run from the base directory to determine whether the site needs rebuilding or not.
   * Check out our [ignore builds](https://docs.netlify.com/configure-builds/common-configurations/ignore-builds/) doc for more information on the default ignore behavior and details about constructing a custom ignore command.
   */
  ignore?: string

  /**
   * Includes the path to a site's [Edge Handlers directory](https://docs.netlify.com/edge-handlers/configure-and-build/#choose-an-edge-handlers-directory)
   */
  edge_handlers?: string
  /**
   * Contains a site's [environment variables](https://docs.netlify.com/configure-builds/environment-variables/#netlify-configuration-variables)
   */
  environment: Partial<Record<string, string>>
  /**
   * Includes options for [post processing](https://docs.netlify.com/configure-builds/file-based-configuration/#post-processing) HTML, CSS, JavaScript, and images
   */
  processing: {
    skip_processing?: boolean
    css: {
      bundle?: boolean
      minify?: boolean
    }
    js: {
      bundle?: boolean
      minify?: boolean
    }
    html: {
      pretty_url?: boolean
    }
    images: {
      compress?: boolean
    }
  }
}

/* eslint-enable camelcase */
