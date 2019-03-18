# Storyblok Migrate

[![Patreon](https://img.shields.io/badge/patreon-donate-blue.svg)](https://www.patreon.com/maoberlehner)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/maoberlehner)
[![Build Status](https://travis-ci.org/maoberlehner/storyblok-migrate.svg?branch=master)](https://travis-ci.org/maoberlehner/storyblok-migrate)
[![GitHub stars](https://img.shields.io/github/stars/maoberlehner/storyblok-migrate.svg?style=social&label=Star)](https://github.com/maoberlehner/storyblok-migrate)

Storyblok schema migrations.

**Warning:** this project is in a very early stage. Because of the nature of what this package is doing, it has the potential to destroy all your content. It is highly recommended to backup your Storyblok Space before using this. Use at your own risk.

## Usage

```bash
npm install --save-dev storyblok-migrate
```

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
  technicalName: 'article',
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
  technicalName: 'meta_image',
};
```

```json
{
  "scripts": {
    "migrate": "storyblok-migrate"
  }
}
```

```bash
# Run all migrations.
npm run migrate
```

## Configuration

Here you can see the default configuration. You must not check in your `oauthToken` into version control (especially if the repository is public)! Use environment variables instead.

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

## About

### Author

Markus Oberlehner  
Website: https://markus.oberlehner.net  
Twitter: https://twitter.com/MaOberlehner  
PayPal.me: https://paypal.me/maoberlehner  
Patreon: https://www.patreon.com/maoberlehner

### License

MIT
