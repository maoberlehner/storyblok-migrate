# Storyblok Migrate

[![Patreon](https://img.shields.io/badge/patreon-donate-blue.svg)](https://www.patreon.com/maoberlehner)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/maoberlehner)
[![Build Status](https://travis-ci.org/maoberlehner/storyblok-migrate.svg?branch=master)](https://travis-ci.org/maoberlehner/storyblok-migrate)
[![GitHub stars](https://img.shields.io/github/stars/maoberlehner/storyblok-migrate.svg?style=social&label=Star)](https://github.com/maoberlehner/storyblok-migrate)

Storyblok schema migrations.

> **Warning:** this project is at a very early stage. Due to the nature of what this package does, it has the potential to destroy all your content. It is strongly recommended that you backup your Storyblok Space before use. Use at your own risk.

## Usage

`storyblok-migrate` can be used either as a global or as a locally installed CLI tool or it can also be used programmatically. But it is recommended to use it as a local dependency of your project.

```bash
# Install it as a local dependency of your project.
npm install storyblok-migrate
```

In the following example you can see a typical file tree of a Nuxt.js project. However, you can see that we have added an additional `storyblok` folder. This is the default directory where `storyblok-migrate` looks for component schema definition files. You can change the directory via [a configuration setting](#configuration).

```
your-storyblok-project/
├── ...
├── assets/
├── src/
├── storyblok
│   ├── article.js
│   └── image-slider.js
└── ...
```

### Schema definitions

In the following two examples you can see how to structure schema definitions. You can read more about how to structure the `schema` part of the definition file and all the possible field types in [the official Storyblok API documentation](https://www.storyblok.com/docs/api/management#core-resources/components/possible-field-types).

The `migrations` property is an optional array with functions you want to run on every migration. It is recommended to either add a condition to prevent a migration from running a second time after it has already done its job, or remove it completely when it is no longer needed. However, for documentation purposes, it is recommended to keep old migrations, but add a condition at the beginning to prevent them from running.

```js
// storyblok/article.js
const metaImage = require('./meta-image');

module.exports = {
  displayName: 'Article',
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
      component_whitelist: [metaImage],
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
  settings: {
    nestable: false,
    root: true,
  },
};
```

```js
// storyblok/meta-image.js
module.exports = {
  displayName: 'Image',
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
  settings: {
    nestable: true,
    root: false,
  },
};
```

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
# Run all migrations.
npx storyblok-migrate --content-migrations
# Run migrations only for specific content types.
npx storyblok-migrate --content-migrations --content-types article,product
# Using shortcuts.
npx storyblok-migrate -c -t article,product
```

## Configuration

This is the default configuration. You must not check in your `oauthToken` into version control (especially if the repository is public)! Use environment variables instead.

```js
// storyblok.config.js
module.exports  = {
  accessToken: process.env.STORYBLOK_ACCESS_TOKEN,
  componentDirectory: 'storyblok',
  dryRun: process.argv.includes('--dry-run'),
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  spaceId: process.env.STORYBLOK_SPACE_ID,
};
```

## Roadmap

### 1.0.0

- Mirror code components to Storyblok
- Only update stories if they have changed
- Backup functionality

### 1.1.0

- Bidirectional synchronization of components
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
