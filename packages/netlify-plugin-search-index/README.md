# Netlify Search Index Plugin

Generate a Search Index you can query via JavaScript or a Netlify Function

## You may not need this

There are other ways to add search to your site, like using Algolia or
[Vanilla JS with a custom search Index](https://www.hawksworx.com/blog/adding-search-to-a-jamstack-site/).

However, you may wish to have a generic way to generate this index based only on crawling your generated static site, or
you may wish to do large index searches in a serverless function instead of making your user download the entire index
and run clientside (tradeoffs abound). If that describes you, read on

## How to use

In your netlify config file add:

```yml
plugins:
  - type: '@netlify/plugin-search-index'
```

## What it does

On `postBuild`, this plugin goes through your HTML files, converts them to searchable text, and stores them as a JSON
blob in `/searchIndex/searchIndex.json`. You can customize the folder name in case of conflict.

You can request this blob in your clientside JavaScript, or you can use the generated function that reads this and
returns search results to be lighter on your frontend.

The generated function is available at `.netlify/functions/searchIndex` and you can use it with a search term:

- `.netlify/functions/searchIndex?s=foo` or
- `.netlify/functions/searchIndex?search=foo`

Under the hood, the search function uses [fuse.js](https://fusejs.io/) and in future we may expose more configurations
for this.

## Configuration

Plugin options:

- `searchIndexFolder` (default: `searchIndex`): where the plugin stores `searchIndex.json`.

## Future development opportunities

- better html parsing - header tags and SEO metadata should be parsed too
- expose fuse.js and html parse search options for more configurability
