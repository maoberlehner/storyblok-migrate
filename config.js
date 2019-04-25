const path = require(`path`);

require(`dotenv`).config();

let customConfig = {};
try {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  customConfig = require(path.resolve(process.cwd(), `storyblok.config`));
} catch (error) {
  // It is ok to have no custom config.
  if (error.code !== `MODULE_NOT_FOUND`) throw error;
}

const defaultConfig = {
  backupDirectory: `backup`,
  componentDirectory: `storyblok`,
  dryRun: process.argv.includes(`--dry-run`),
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  spaceId: process.env.STORYBLOK_SPACE_ID,
};

module.exports = { ...defaultConfig, ...customConfig };
