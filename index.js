const config = require(`./config`);
const discover = require(`./utils/discover`);
const migrate = require(`./utils/migrate`);

const storyService = require(`./services/story`);

if (config.dryRun) {
  // eslint-disable-next-line no-console
  console.warn(`Dry run mode activated!`);
}

function contentTypesFromComponents(components) {
  return components.map(x => x.name);
}

module.exports = async function runMigrations({ components, page = 1 }) {
  const contentTypes = contentTypesFromComponents(components);
  const { data, pageCount } = await storyService.list({ contentTypes, page });

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
    await storyService.update({ story });
    // eslint-disable-next-line no-console
    console.log(`Story ${story.id} has been updated`);
  }

  if (page >= pageCount) return;

  await runMigrations({ components, page: page + 1 });
};
