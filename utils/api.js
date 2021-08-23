const StoryblokClient = require(`storyblok-js-client`);

const { oauthToken, proxy } = require(`../config`);

module.exports = new StoryblokClient({
  oauthToken,
  proxy,
});
