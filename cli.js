#!/usr/bin/env node
const { prompt } = require(`enquirer`);
const commander = require(`commander`);

const {
  runContentMigrations,
} = require(`./`);
const { version } = require(`./package`);
const discover = require(`./utils/discover`);

async function start() {
  commander
    .version(version)
    .option(`-c, --content-migrations`, `run content migrations`)
    .option(
      `-t, --content-types <items>`,
      `comma separated list of content types which you want to migrate (default: all)`,
    )
    .option(`--dry-run`, `see what would happen without applying the changes`)
    .parse(process.argv);

  const contentTypeComponents = discover.contentTypeComponents();

  if (commander.contentMigrations) {
    const filteredComponents = commander.contentTypes
      ? contentTypeComponents.filter(x => commander.contentTypes.includes(x.name))
      : contentTypeComponents;
    runContentMigrations({ components: filteredComponents });
    return;
  }

  const questions = [
    {
      disabled: `No`,
      enabled: `Yes`,
      initial: 1,
      message: `Do you want to run content migrations?`,
      name: `contentMigrations`,
      type: `toggle`,
    },
    {
      disabled: `No`,
      enabled: `Yes`,
      initial: 1,
      message: `Migrate all content types?`,
      name: `allContentTypes`,
      skip() {
        return !this.state.answers.contentMigrations;
      },
      type: `toggle`,
    },
    {
      choices: contentTypeComponents.map(x => x.displayName),
      message: `Which content types do you want to migrate?`,
      name: `components`,
      result(value) {
        return contentTypeComponents.filter(x => value.includes(x.displayName));
      },
      skip() {
        return this.state.answers.allContentTypes;
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

  if (answers.contentMigrations) {
    const filteredComponents = answers.allContentTypes
      ? contentTypeComponents
      : answers.components;
    await runContentMigrations({ components: filteredComponents });
  }
}

start();
