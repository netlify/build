/**
 * Display information in the deploy summary
 */
export interface NetlifyPluginStatusUtil {
  /**
   * Only one status is shown per plugin.
   * Calling `utils.status.show()` twice overrides the previous status.
   */
  show(options: {
    /**
     * Default to the plugin's name followed by a generic title.
     */
    title?: string
    /**
     * Message below the title
     */
    summary: string
    /**
     * Detailed information shown in a collapsible section.
     * @default ""
     */
    text?: string
  }): void
}
