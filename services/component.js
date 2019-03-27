const { spaceId } = require(`../config`);
const api = require(`../utils/api`);

function removeMigrations(component) {
  const { migrations, ...cleanComponent } = component;
  return cleanComponent;
}

function list() {
  return api.get(`spaces/${spaceId}/components`);
}

function create({ component }) {
  return api.post(`spaces/${spaceId}/components`, {
    component: removeMigrations(component),
  });
}

function update({ component }) {
  return api.put(`spaces/${spaceId}/components/${component.id}`, {
    component: removeMigrations(component),
  });
}

module.exports = {
  create,
  list,
  update,
};
