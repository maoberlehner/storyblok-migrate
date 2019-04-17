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

  if (commander.components) {
    const { data } = await componentService.list();
    const filePath = path.resolve(process.cwd(), backupDirectory, `components_${date}.json`);
    const fileContent = JSON.stringify(data, null, 2);
    fs.writeFile(filePath, fileContent, { flag: `w` }, (error) => {
      if (error) throw error;
      // eslint-disable-next-line no-console
      console.log(`Successfully created a backup of all of your components.`);
    });
  }

  if (commander.stories) {
    const storyPages = await unpaginate({ cb: storyService.list });
    storyPages.forEach((data, page) => {
      const filePath = path.resolve(process.cwd(), backupDirectory, `stories_${date}_${page + 1}.json`);
      const fileContent = JSON.stringify(data, null, 2);
      fs.writeFile(filePath, fileContent, { flag: `w` }, (error) => {
        if (error) throw error;
        // eslint-disable-next-line no-console
        console.log(`Successfully created a backup of all stories of page ${page + 1} of ${storyPages.length}.`);
      });
    });
  }
}

start();
