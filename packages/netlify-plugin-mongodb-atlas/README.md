# Netlify MongoDB Atlas plugin

Provisions and makes available MongoDB Atlas databases.

## How to use

In your netlify config file add:

```yml
plugins:
  - netlify-plugin-mongodb-atlas
```

## Configuration

Configure the plugin:

```yml
plugins:
  - netlify-plugin-mongodb-atlas
      publicKey: <MongoDB Atlas Public API Key>
      privateKey: <MongoDB Atlas Private API Key>
      project: <Name of the project where this database will reside>
      cluster: <Name of the cluster that is going to be created>
      dbUsername: <Database username>
      dbUserPassword: <Database password>
```
