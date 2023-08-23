import fetch from 'node-fetch'

type AvailableIntegration = {
  slug: string
  hostSiteUrl: string
}

export const getAvailableIntegrations = async function (): Promise<AvailableIntegration[]> {
  const response = await fetch('https://api.netlifysdk.com/integrations')

  if (response.ok) {
    const integrations = (await response.json()) as AvailableIntegration[]
    return Array.isArray(integrations) ? integrations : []
  } else {
    throw new Error(`Failed retrieving integrations: ${response.statusText}`)
  }
}
