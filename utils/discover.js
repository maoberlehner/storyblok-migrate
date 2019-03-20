const glob = require(`glob`);
const path = require(`path`);

const config = require(`../config`);

function findComponent() {
  const directory = path.resolve(process.cwd(), config.componentDirectory);

  return glob.sync(path.join(directory, `**`, `*.js`))
    // eslint-disable-next-line global-require, import/no-dynamic-require
    .map(file => require(path.resolve(directory, file)));
}

const components = findComponent();

function contentTypeComponents() {
  return components.filter(x => x.settings.root);
}

function componentByName(name) {
  return components.find(x => x.technicalName === name);
}

module.exports = {
  contentTypeComponents,
  componentByName,
};
