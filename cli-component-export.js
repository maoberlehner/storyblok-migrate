#!/usr/bin/env node
const commander = require(`commander`);
const fs = require(`fs`);
const path = require(`path`);

const { componentDirectory } = require(`./config`);
const { version } = require(`./package`);
const componentService = require(`./services/component`);

async function start() {
  commander
    .version(version)
    .option(
      `-c, --components <items>`,
      `comma separated list of components which you want to export from storyblok`,
    )
    .parse(process.argv);

  const { data } = await componentService.list();
  data.components
    .filter(x => (commander.components ? commander.components.includes(x.name) : true))
    .forEach((component) => {
      const filePath = path.resolve(process.cwd(), componentDirectory, `${component.name}.js`);
      // eslint-disable-next-line camelcase
      const { created_at, id, ...cleanComponent } = component;
      const fileContent = `module.exports = ${JSON.stringify(cleanComponent, null, 2)}`;
      fs.writeFile(filePath, fileContent, { flag: `w` }, (error) => {
        if (error) throw error;
        // eslint-disable-next-line no-console
        console.log(`Successfully exported component "${component.name}".`);
      });
    });
}

start();
