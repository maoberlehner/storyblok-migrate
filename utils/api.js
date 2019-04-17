const StoryblokClient = require(`storyblok-js-client`);

const { oauthToken } = require(`../config`);

module.exports = new StoryblokClient({
  oauthToken,
});
