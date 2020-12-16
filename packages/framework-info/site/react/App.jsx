import React, { useState, useEffect } from 'react'

import { listFrameworks } from '../../dist'

const repo = 'netlify-templates/gatsby-starter-netlify-cms'

const get = async (path = '') => {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`)
  return response.json()
}

const listFiles = async () => {
  const { default_branch } = await get()
  const { tree } = await get(`/git/trees/${default_branch}?recursive=1`)
  return tree.map(({ path }) => path)
}

const getPackageJson = async () => {
  const { content } = await get('/contents/package.json')
  const raw = atob(content)
  return JSON.parse(raw)
}

const getContext = async () => {
  const [repoFiles, packageJson] = await Promise.all([listFiles(), getPackageJson()])
  const pathExists = (path) => {
    const normalizedPath = path.startsWith('./') ? path.slice(2) : path
    return repoFiles.includes(normalizedPath)
  }
  return { pathExists, packageJson }
}

const Framework = (framework) => {
  return <div key={framework.name}>{JSON.stringify(framework)}</div>
}

export const App = () => {
  const [frameworks, setFrameworks] = useState([])

  useEffect(() => {
    let canceled = false

    const fetchFrameworks = async () => {
      const context = await getContext()
      const frameworks = await listFrameworks(context)
      if (!canceled) {
        setFrameworks(frameworks)
      }
    }

    fetchFrameworks()
    return () => {
      canceled = true
    }
  }, [])

  return frameworks.map((framework) => <Framework {...framework} />)
}
