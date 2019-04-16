const { spaceId } = require(`../config`);
const api = require(`../utils/api`);

async function list({ contentTypes, page }) {
  const response = await api.get(`cdn/stories`, {
    filter_query: {
      component: {
        in: contentTypes.join(`,`),
      },
    },
    page,
    per_page: 100,
    version: `draft`,
  });
  const pageCount = Math.ceil(response.total / response.perPage);

  return { pageCount, ...response };
}

function update({ story }) {
  return api.put(`spaces/${spaceId}/stories/${story.id}`, { story, publish: true });
}

module.exports = {
  list,
  update,
};
