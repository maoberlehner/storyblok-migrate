const { spaceId } = require(`../config`);
const api = require(`../utils/api`);

function list() {
  return api.get(`spaces/${spaceId}/components`);
}

function create({ component }) {
  return api.post(`spaces/${spaceId}/components`, {
    component,
  });
}

function update({ component }) {
  return api.put(`spaces/${spaceId}/components/${component.id}`, {
    component,
  });
}

module.exports = {
  create,
  list,
  update,
};
