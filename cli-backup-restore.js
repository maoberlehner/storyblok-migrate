#!/usr/bin/env node
const commander = require(`commander`);
const path = require(`path`);

const { version } = require(`./package`);
const componentService = require(`./services/component`);
const config = require(`./config`);
const storyService = require(`./services/story`);

async function start() {
  try {
    commander
      .version(version)
      .parse(process.argv);

    const filePath = path.resolve(process.cwd(), process.argv[2]);
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const file = require(filePath);

    if (file.components) {
      for (const component of file.components) {
        if (config.dryRun) {
          // eslint-disable-next-line no-console
          console.info(`Component "${component.display_name || component.name}" would've been restored`);
          continue;
        }

        await componentService.createOrUpdate({ component });
        // eslint-disable-next-line no-console
        console.info(`Restored component "${component.display_name || component.name}"`);
      }
    }

    if (file.stories) {
      for (const story of file.stories) {
        if (config.dryRun) {
          // eslint-disable-next-line no-console
          console.info(`Story "${story.name}" would've been restored`);
          continue;
        }

        await storyService.createOrUpdate({ story });
        // eslint-disable-next-line no-console
        console.info(`Restored story "${story.name}"`);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
}

start();
