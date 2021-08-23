const StoryblokClient = require(`storyblok-js-client`);

const { oauthToken, proxy, https, httpsAgent } = require(`../config`);

const sbcConfig = {
  oauthToken,
  proxy,
  https,
  httpsAgent,
};
console.info('ECHO: sbcConfig :=', sbcConfig);

module.exports = new StoryblokClient(sbcConfig);
