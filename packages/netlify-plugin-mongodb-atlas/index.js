/**
 * Generates sitemap
 */
const { URL } = require('url')

const DigestFetch = require('digest-fetch')

let client
const urlBase = "https://cloud.mongodb.com/api/atlas/v1.0/"

async function apiCall({ endpoint = '/', method = 'GET', pathParams = {}, queryParams = {}, bodyParams = {} }) {
  if (!client) throw new Error('MongoDB Atlas: API client not valid')

  const endpointURL = new URL(endpoint, urlBase)

  for (const key in pathParams) endpointURL.pathname = endpointURL.pathname.replace(`{${key}`, pathParams[key])
  for (const key in queryParams) endpointURL.searchParams.append(key, queryParams[key])

  const body = method.toUpperCase() === 'POST' && JSON.stringify(bodyParams)
  return client.fetch(endpointURL, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body,
  })
    .then(resp => resp.json())
}

async function ensureProject({ projectName }) {
  let project
  try {
    project = await apiCall({ endpoint: '/groups/byName/{GROUP-NAME}', pathParams: { 'GROUP-NAME': projectName } })
    console.log('MongoDB Atlas: Found a existing project')
  } catch (err) {
    console.log('MongoDB Atlas: Creating a new project')
    project = await apiCall({ endpoint: '/groups', bodyParams: { name: projectName } })
  }

  return project
}

async function ensureCluster({ clusterName, projectId }) {
  let cluster
  try {
    cluster = await apiCall({
      endpoint: '/groups/{GROUP-ID}/clusters/{CLUSTER-NAME}',
      pathParams: { 'GROUP-ID': projectId, 'CLUSTER-NAME': clusterName }
    })
    console.log('MongoDB Atlas: Found a existing cluster')
  } catch (err) {
    console.log('MongoDB Atlas: Creating a new cluster')
    cluster = await apiCall({
      endpoint: '/groups/{GROUP-ID}/clusters',
      method: 'POST',
      pathParams: { 'GROUP-ID': projectId },
      bodyParams: {
        name: clusterName,
        providerSettings: {
          instanceSizeName: 'M2',
          providerName: 'AWS',
          regionName: 'US_EAST_1',
        },
      },
    })

    let res, rej
    const wait = new Promise((resolve, reject) => {
      res = resolve
      rej = reject
    })

    const checker = setInterval(async () => {
      cluster = await apiCall({
        endpoint: '/groups/{GROUP-ID}/clusters/{CLUSTER-NAME}',
        pathParams: { 'GROUP-ID': projectId, 'CLUSTER-NAME': clusterName }
      })
      console.log(`MongoDB Atlas: Cluster state "${cluster.stateName}"`)

      if (cluster.stateName === 'DELETED') {
        clearInterval(checker)
        rej('MongoDB Atlas: Invalid state for cluster')
      } else if (cluster.stateName === 'IDLE') {
        clearInterval(checker)
        res()
      }

    }, 30000)

    await wait
  }

  return cluster
}

async function ensureUser({ username, password, projectId }) {
  let user
  try {
    user = await apiCall({
      endpoint: '/groups/{GROUP-ID}/databaseUsers/admin/{USERNAME}',
      pathParams: { 'GROUP-ID': projectId, 'USERNAME': username }
    })
    console.log('MongoDB Atlas: Found a existing user')
  } catch (err) {
    console.log('MongoDB Atlas: Creating new user')
    user = await apiCall({
      endpoint: '/groups/{GROUP-ID}/databaseUsers',
      pathParams: { 'GROUP-ID': projectId },
      bodyParams: {
        username,
        password,
        databaseName: 'admin',
        roles: [{ databaseName: 'admin', roleName: 'readWrite' }]
      },
    })
  }

  return user
}

async function ensureResources(opts = {}) {
  const project = await ensureProject({ projectName: opts.project })
  const cluster = await ensureCluster({ clusterName: opts.cluster, projectId: project.id })
  const user = await ensureUser({ username: opts.dbUsername, password: opts.dbPassword, projectId: project.id })

  const connectionURI = new URL(cluster.mongoURIWithOptions)
  connectionURI.username = user.username
  connectionURI.password = opts.dbPassword

  process.env.MONGODB_ATLAS_CONNECTION_URI = connectionURI.toString()
}

function netlifyMongoDBAtlasPlugin(conf = {}) {
  return {
    // Hook into lifecycle
    preBuild: async () => {
      for (const key of ['publicKey', 'privateKey', 'project', 'cluster', 'dbUsername', 'dbPassword']) {
        if (!conf[key]) throw new Error(`MongoDB Atlas: Missing "${key}" from configuration`)
      }
      const { publicKey, privateKey, project, cluster, dbUsername, dbPassword } = conf

      if (!client) client = new DigestFetch(publicKey, privateKey, {})

      await ensureResources({ project, cluster, dbUsername, dbPassword })
    }
  }
}

module.exports = netlifyMongoDBAtlasPlugin
