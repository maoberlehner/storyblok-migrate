const StoryblokClient = require(`storyblok-js-client`);

const { accessToken, oauthToken } = require(`../config`);

module.exports = new StoryblokClient({
  accessToken,
  oauthToken,
});
