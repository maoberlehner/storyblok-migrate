const StoryblokClient = require(`storyblok-js-client`);

const { oauthToken, proxy, https, httpsAgent } = require(`../config`);

module.exports = new StoryblokClient({
  oauthToken,
  proxy,
  https,
  httpsAgent,
});
