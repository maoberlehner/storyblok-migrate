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

  try {
    const { data } = await componentService.list();

    const directory = path.resolve(process.cwd(), componentDirectory);
    await fs.promises.mkdir(directory, { recursive: true });

    data.components
      .filter(x => (commander.components ? commander.components.includes(x.name) : true))
      .forEach(async (component) => {
        const fileName = `${component.name}.js`;
        const fullPath = path.join(directory, fileName);
        // eslint-disable-next-line camelcase
        const { created_at, id, ...cleanComponent } = component;
        const fileContent = `module.exports = ${JSON.stringify(cleanComponent, null, 2)}`;

        await fs.promises.writeFile(fullPath, fileContent, { flag: `w` });

        // eslint-disable-next-line no-console
        console.log(`Successfully exported component "${component.name}".`);
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
}

start();
