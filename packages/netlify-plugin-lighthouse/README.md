## Netlify Plugin Lighthouse

this does a basic lighthouse run and reports and stores the results. if it there has been a previous run, it also diffs
the results to report improvements.

This shows the diffs:

![image](https://user-images.githubusercontent.com/6764957/62481118-8749c880-b77f-11e9-91d9-44ae028c452b.png)

## Usage

Inside your `netlify.yml`:

```yaml
plugins:
  - type: '@netlify/plugin-lighthouse'
    config:
      currentVersion: '0.0.3'
      compareWithVersion: '0.0.1'
```

you can pin lighthouse result versions:

```yaml
plugins:
  - type: '@netlify/plugin-lighthouse'
    config:
      currentVersion: '0.0.3'
      compareWithVersion: '0.0.1'
```

## TODO

https://github.com/netlify/build/issues/27
