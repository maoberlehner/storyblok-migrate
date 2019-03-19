#!/usr/bin/env node
const { prompt } = require(`enquirer`);
const commander = require(`commander`);

const { version } = require(`./package`);
const discover = require(`./utils/discover`);
const runMigrations = require(`./`);

const components = discover.contentTypeComponents();

async function start() {
  commander
    .version(version)
    .option(`-c, --content-migrations`, `run content migrations`)
    .option(
      `-t, --content-types <items>`,
      `comma separated list of components (technical names) which you want to migrate (default: all)`,
    )
    .parse(process.argv);

  if (commander.contentMigrations) {
    const mappedComponents = commander.contentTypes
      ? components.filter(x => commander.contentTypes.includes(x.technicalName))
      : components;

    runMigrations({ components: mappedComponents });
    return;
  }

  const questions = [
    {
      disabled: `No`,
      enabled: `Yes`,
      initial: 1,
      message: `Do you want to run content migrations?`,
      name: `migrateContent`,
      type: `toggle`,
    },
    {
      choices: [
        `All`,
        ...components.map(x => x.displayName),
      ],
      initial: 0,
      message: `Which content types do you want to migrate?`,
      name: `components`,
      result(value) {
        if (value[0] === `All`) {
          return components;
        }
        return components.filter(x => value.includes(x.technicalName));
      },
      type: `multiselect`,
    },
    {
      disabled: `No`,
      enabled: `Yes`,
      initial: 0,
      message: `Ready to start migration?`,
      name: `confirm`,
      type: `toggle`,
    },
  ];
  const answers = await prompt(questions);

  if (!answers.confirm) {
    // eslint-disable-next-line no-console
    console.log(`Migration canceled.`);
  }

  if (answers.migrateContent) {
    runMigrations({ components: answers.components });
  }
}

start();
