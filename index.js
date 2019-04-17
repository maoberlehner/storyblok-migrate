const cloneDeep = require(`lodash.clonedeep`);
const isEqual = require(`lodash.isequal`);

const config = require(`./config`);
const discover = require(`./utils/discover`);
const migrate = require(`./utils/migrate`);

const componentService = require(`./services/component`);
const storyService = require(`./services/story`);
const unpaginate = require(`./utils/unpaginate`);

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
        console.info(`${component.display_name} component would've been updated`);
        // eslint-disable-next-line no-continue
        continue;
      }
      const mappedComponent = { id: remoteComponent.id, ...component };
      // eslint-disable-next-line no-await-in-loop
      await componentService.update({ component: mappedComponent });
      // eslint-disable-next-line no-console
      console.log(`${component.display_name} component has been updated`);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (config.dryRun) {
      // eslint-disable-next-line no-console
      console.info(`${component.display_name} component would've been created`);
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await componentService.create({ component });
    // eslint-disable-next-line no-console
    console.log(`${component.display_name} component has been created`);
  }
}

async function runContentMigrations({ components }) {
  const contentTypes = contentTypesFromComponents(components);
  const storyPages = await unpaginate({ cb: storyService.list, params: { contentTypes } });
  const stories = storyPages.reduce((prev, next) => [...prev, ...next.stories], []);

  // eslint-disable-next-line no-restricted-syntax
  for (const originalStory of stories) {
    const story = cloneDeep(originalStory);
    const componentName = story.content.component;
    const component = discover.componentByName(componentName);

    if (!component) {
      throw new Error(`No component found for name "${componentName}"`);
    }

    migrate({
      component,
      content: story.content,
    });

    if (isEqual(story, originalStory)) {
      // eslint-disable-next-line no-console
      console.info(`Story "${story.id}" has not changed and was skipped`);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (config.dryRun) {
      // eslint-disable-next-line no-console
      console.info(`Story "${story.id}" would've been updated`);
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await storyService.update({ story });
    // eslint-disable-next-line no-console
    console.log(`Story "${story.id}" has been updated`);
  }
}

module.exports = {
  runComponentMigrations,
  runContentMigrations,
};
