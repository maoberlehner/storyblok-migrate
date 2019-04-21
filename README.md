# storyblok-migrate

[![Patreon](https://img.shields.io/badge/patreon-donate-blue.svg)](https://www.patreon.com/maoberlehner)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/maoberlehner)
[![Build Status](https://travis-ci.org/maoberlehner/storyblok-migrate.svg?branch=master)](https://travis-ci.org/maoberlehner/storyblok-migrate)
[![GitHub stars](https://img.shields.io/github/stars/maoberlehner/storyblok-migrate.svg?style=social&label=Star)](https://github.com/maoberlehner/storyblok-migrate)

> Storyblok component and content migrations.

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O4O7U55Y)

> **Warning:** this project is at a very early stage. Due to the nature of what this package does, it has the potential to destroy all your content. It is strongly recommended that you backup your Storyblok Space before use. Use at your own risk.

## Usage

`storyblok-migrate` can be used either as a global or as a locally installed CLI tool or it can also be used programmatically. But it is recommended to use it as a local dependency of your project.

```bash
# Install it as a local dependency of your project.
npm install storyblok-migrate
```

In the following example you can see a typical file tree of a Storyblok website project. However, you can see that we have added an additional `storyblok` folder. This is the default directory where `storyblok-migrate` looks for component definition files. You can change the directory via [a configuration setting](#configuration).

```
your-storyblok-project/
├── ...
├── assets/
├── src/
├── storyblok
│   ├── article.js
│   └── meta_image.js
└── ...
```

### Component definitions

Next up you can see how to structure component definitions. You can read more about how to structure the `schema` part of the definition file and all the possible field types in [the official Storyblok API documentation](https://www.storyblok.com/docs/api/management#core-resources/components/possible-field-types).

The `migrations` property is an optional array with functions you want to run on every migration. It is recommended to either add a condition to prevent a migration from running a second time after it has already done its job, or remove it completely when it is no longer needed. However, for documentation purposes, it is recommended to keep old migrations, but add a condition at the beginning to prevent them from running.

```js
// storyblok/article.js
const metaImage = require('./meta_image');

module.exports = {
  display_name: 'Article',
  is_nestable: false,
  is_root: true,
  migrations: [
    // Replace `headline` field with new `title` field.
    ({ content }) => {
      if (!content.headline) return;

      content.title = content.headline;
      delete content.headline;
    },
  ],
  name: 'article',
  schema: {
    image: {
      component_whitelist: [metaImage.name],
      maximum: 1,
      pos: 10,
      restrict_components: true,
      type: 'bloks',
    },
    title: {
      pos: 0,
      type: 'text',
    },
  },
};
```

```js
// storyblok/meta_image.js
module.exports = {
  display_name: 'Image',
  is_nestable: true,
  is_root: false,
  migrations: [
    // Replace `url` field with new `src` field.
    ({ content }) => {
      if (!content.url) return;

      content.src = content.url;
      delete content.url;
    },
  ],
  name: 'meta_image',
  schema: {
    alt: {
      pos: 10,
      type: 'text',
    },
    src: {
      maximum: 1,
      pos: 0,
      type: 'image',
    },
  },
};
```

### Using the CLI

`storyblok-migrate` is a CLI tool with two modes. You can run it either in UI mode or with parameters.

**Run in UI mode**

When running `storyblok-migrate` in UI mode you'll be asked what migrations you want to run.

```bash
npx storyblok-migrate
```

**Run with parameters**

Usually you want to run `storyblok-migrate` with paramters as part of your build process because it's not possible to use the UI mode there.

```json
{
  "scripts": {
    "migrate": "storyblok-migrate --content-migrations",
    "build": "npm run migrate && webpack"
  }
}
```

You can also run `storyblok-migrate` manually with parameters.

```bash
# Run all component migrations.
npx storyblok-migrate --component-migrations
# Run component migrations only for specific components.
npx storyblok-migrate --component-migrations --components article,meta_image
# Using shortcuts.
npx storyblok-migrate -p -c article,meta_image
```

```bash
# Run all content migrations.
npx storyblok-migrate --content-migrations
# Run content migrations only for specific content types.
npx storyblok-migrate --content-migrations --content-types article,product
# Using shortcuts.
npx storyblok-migrate -n -t article,product
```

## Helpers

This package also provides some helper commands for your convenience.

### Backup

In order to create a backup of your stories and components, you can use the following commands.

```bash
# Backup all components.
npx storyblok-backup --components
# Backup all stories.
npx storyblok-backup --stories
# Backup everything.
npx storyblok-backup --components --stories
```

You can change the location where backups should be saved by changing the `backupDirectory` [configuration option](#configuration).

### Component export

If you want to export your components from Storyblok in order to use them as a starting point for your component definitions, you can use the `storyblok-component-export` CLI command.

```bash
# Export all components.
npx storyblok-component-export
# Export only specific components.
npx storyblok-component-export article,product
```

Running those commands creates new files for those components inside of your `componentDirectory`. **If a component with the same name already exists, it will be overwritten!**

## Configuration

This is the default configuration. You must not check in your `oauthToken` into version control (especially if the repository is public)! Use environment variables instead.

```js
// storyblok.config.js
module.exports = {
  componentDirectory: 'storyblok',
  backupDirectory: 'backup',
  dryRun: process.argv.includes('--dry-run'),
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  spaceId: process.env.STORYBLOK_SPACE_ID,
};
```

## Tips & Tricks

### Fragments

You can add files starting with an underscore to your `componentDirectory`, those files will be ignored and not treated as component definition files. You can use those files to sepcify schema fragments which you can reuse in multiple component definition files.

```js
// storyblok/_meta_image.js
module.exports = ({ startPos = 0 }) => ({
  image: {
    type: 'section',
    keys: [
      'image_src',
      'image_dominant_color',
      'image_alt',
      'image_title',
    ],
    pos: startPos,
  },
  image_src: {
    type: 'image',
    pos: startPos + 1,
  },
  image_alt: {
    type: 'text',
    pos: startPos + 2,
  },
  image_title: {
    type: 'text',
    pos: startPos + 3,
  },
});
```

```js
// storyblok/article.js
const metaImageFragment = require('./_meta_image');

module.exports = {
  // ...
  schema: {
    title: {
      pos: 0,
      type: 'text',
    },
    ...metaImageFragment({ startPos: 10 }),
  },
  // ...
};
```

## Roadmap

### 1.0.0

- Migration versioning
- Rollbacks

## About

### Author

Markus Oberlehner  
Website: https://markus.oberlehner.net  
Twitter: https://twitter.com/MaOberlehner  
PayPal.me: https://paypal.me/maoberlehner  
Patreon: https://www.patreon.com/maoberlehner

### License

MIT
