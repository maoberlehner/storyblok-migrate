#!/usr/bin/env node
const { prompt } = require(`enquirer`);
const commander = require(`commander`);

const {
  runContentMigrations,
  runComponentMigrations,
} = require(`./`);
const { version } = require(`./package`);
const discover = require(`./utils/discover`);

async function start() {
  commander
    .version(version)
    .option(`-p, --component-migrations`, `run component migrations`)
    .option(
      `-c, --components <items>`,
      `comma separated list of components which you want to migrate (default: all)`,
    )
    .option(`-n, --content-migrations`, `run content migrations`)
    .option(
      `-t, --content-types <items>`,
      `comma separated list of content types which you want to migrate (default: all)`,
    )
    .option(`--dry-run`, `see what would happen without applying the changes`)
    .parse(process.argv);

  const { components } = discover;

  if (commander.componentMigrations) {
    const filteredComponents = commander.components
      ? components.filter(x => commander.components.includes(x.name))
      : components;
    runComponentMigrations({ components: filteredComponents });
    return;
  }

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
      message: `Do you want to run component migrations?`,
      name: `componentMigrations`,
      type: `toggle`,
    },
    {
      disabled: `No`,
      enabled: `Yes`,
      initial: 1,
      message: `Migrate all components?`,
      name: `allComponents`,
      skip() {
        return !this.state.answers.componentMigrations;
      },
      type: `toggle`,
    },
    {
      choices: components.map(x => x.display_name),
      message: `Which components do you want to migrate?`,
      name: `selectedComponents`,
      result(value) {
        return components.filter(x => value.includes(x.display_name));
      },
      skip() {
        return this.state.answers.allComponents;
      },
      type: `multiselect`,
    },
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
      choices: contentTypeComponents.map(x => x.display_name),
      message: `Which content types do you want to migrate?`,
      name: `selectedContentTypeComponents`,
      result(value) {
        return contentTypeComponents.filter(x => value.includes(x.display_name));
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
  const {
    allComponents,
    allContentTypes,
    componentMigrations,
    confirm,
    contentMigrations,
    selectedComponents,
    selectedContentTypeComponents,
  } = await prompt(questions);

  const migrateAnything = componentMigrations || contentMigrations;
  if (!confirm || !migrateAnything) {
    // eslint-disable-next-line no-console
    console.log(`Migration canceled.`);
  }

  if (componentMigrations) {
    const filteredComponents = allComponents
      ? components
      : selectedComponents;
    await runComponentMigrations({ components: filteredComponents });
  }

  if (contentMigrations) {
    const filteredComponents = allContentTypes
      ? contentTypeComponents
      : selectedContentTypeComponents;
    await runContentMigrations({ components: filteredComponents });
  }
}

start();
