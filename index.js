const StoryblokClient = require(`storyblok-js-client`);

const config = require(`./config`);
const discover = require(`./utils/discover`);
const migrate = require(`./utils/migrate`);

if (config.dryRun) {
  // eslint-disable-next-line no-console
  console.warn(`Dry run mode activated!`);
}

const api = new StoryblokClient({
  accessToken: config.accessToken,
  oauthToken: config.oauthToken,
});

function contentTypesFromComponents(components) {
  return components.map(x => x.name);
}

function fetchStories(contentTypes, page) {
  return api.get(`cdn/stories`, {
    filter_query: {
      component: {
        in: contentTypes.join(`,`),
      },
    },
    page,
    per_page: 100,
    version: `draft`,
  });
}

module.exports = async function runMigrations({ components, page = 1 }) {
  const contentTypes = contentTypesFromComponents(components);
  const { data, perPage, total } = await fetchStories(contentTypes, page);
  const pageCount = Math.ceil(total / perPage);

  // eslint-disable-next-line no-restricted-syntax
  for (const story of data.stories) {
    const componentName = story.content.component;
    const component = discover.componentByName(componentName);

    if (!component) {
      throw new Error(`No component found for name "${componentName}"`);
    }

    migrate({
      component,
      content: story.content,
    });

    if (config.dryRun) {
      // eslint-disable-next-line no-console
      console.info(`Story ${story.id} would've been updated`);
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await api.put(`spaces/${config.spaceId}/stories/${story.id}`, { story });
    // eslint-disable-next-line no-console
    console.log(`Story ${story.id} has been updated`);
  }

  if (page >= pageCount) return;

  await runMigrations({ components, page: page + 1 });
};
