const discover = require(`./discover`);

module.exports = function migrate({ component = {}, content = {} }) {
  const { migrations } = {
    migrations: [],
    ...component,
  };

  migrations.forEach(migration => migration({ content }));

  Object.values(content).forEach((rawSubContent) => {
    const subContentArray = Array.isArray(rawSubContent)
      ? rawSubContent
      : [rawSubContent];

    subContentArray.forEach((subContent) => {
      if (!subContent.component) return;
      const subComponent = discover.componentByName(subContent.component);
      if (!subComponent) return;

      migrate({
        component: subComponent,
        content: subContent,
      });
    });
  });
};
