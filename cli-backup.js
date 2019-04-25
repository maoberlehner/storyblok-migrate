#!/usr/bin/env node
const commander = require(`commander`);
const fs = require(`fs`);
const path = require(`path`);

const { backupDirectory } = require(`./config`);
const { version } = require(`./package`);
const componentService = require(`./services/component`);
const storyService = require(`./services/story`);
const unpaginate = require(`./utils/unpaginate`);

async function start() {
  try {
    commander
      .version(version)
      .option(
        `-c, --components`,
        `create a backup of all components`,
      )
      .option(
        `-s, --stories`,
        `create a backup of all stories`,
      )
      .parse(process.argv);

    const date = new Date().toISOString().split(`.`)[0].replace(/:/g, ``);
    const directory = path.resolve(process.cwd(), backupDirectory);

    if (commander.components) {
      const { data } = await componentService.list();
      const fileName = `components_${date}.json`;
      const fullPath = path.join(directory, fileName);
      const fileContent = JSON.stringify(data, null, 2);

      await fs.promises.mkdir(directory, { recursive: true });
      await fs.promises.writeFile(fullPath, fileContent, { flag: `w` });

      // eslint-disable-next-line no-console
      console.log(`Successfully created a backup of all of your components.`);
    }

    if (commander.stories) {
      const storyPages = await unpaginate({ cb: storyService.list });
      await fs.promises.mkdir(directory, { recursive: true });

      storyPages.forEach(async (data, page) => {
        const fileName = `stories_${date}_${page + 1}.json`;
        const fullPath = path.join(directory, fileName);
        const fileContent = JSON.stringify(data, null, 2);

        await fs.promises.writeFile(fullPath, fileContent, { flag: `w` });

        // eslint-disable-next-line no-console
        console.log(`Successfully created a backup of all stories of page ${page + 1} of ${storyPages.length}.`);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
}

start();
