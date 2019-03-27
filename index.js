const config = require(`./config`);
const discover = require(`./utils/discover`);
const mapComponent = require(`./utils/map-component`);
const migrate = require(`./utils/migrate`);

const componentService = require(`./services/component`);
const storyService = require(`./services/story`);

if (config.dryRun) {
  // eslint-disable-next-line no-console
  console.warn(`Dry run mode activated!`);
}

function contentTypesFromComponents(components) {
  return components.map(x => x.name);
}

async function runComponentMigrations({ components }) {
  const { data: { components: remoteComponents } } = await componentService.list();

  // eslint-disable-next-line no-restricted-syntax
  for (const component of components) {
    const remoteComponent = remoteComponents
      .find(x => x.name === component.name);
    // eslint-disable-next-line no-continue
    if (remoteComponent) {
      if (config.dryRun) {
        // eslint-disable-next-line no-console
        console.info(`${component.displayName} component would've been updated`);
        // eslint-disable-next-line no-continue
        continue;
      }
      const mappedComponent = { id: remoteComponent.id, ...mapComponent(component) };
      // eslint-disable-next-line no-await-in-loop
      await componentService.update({ component: mappedComponent });
      // eslint-disable-next-line no-console
      console.log(`${component.displayName} component has been updated`);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (config.dryRun) {
      // eslint-disable-next-line no-console
      console.info(`${component.displayName} component would've been created`);
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await componentService.create({ component: mapComponent(component) });
  }
}

async function runContentMigrations({ components, page = 1 }) {
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

  await runContentMigrations({ components, page: page + 1 });
}

module.exports = {
  runComponentMigrations,
  runContentMigrations,
};
