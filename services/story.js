const { spaceId } = require(`../config`);
const api = require(`../utils/api`);

function get({ id }) {
  return api.get(`spaces/${spaceId}/stories/${id}`);
}

async function getMultiple({ ids }) {
  const storyResponses = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    storyResponses.push(await get({ id }));
  }
  return storyResponses;
}

async function list({ contentTypes, page } = {}) {
  const response = await api.get(`spaces/${spaceId}/stories`, {
    filter_query: contentTypes && {
      component: {
        in: contentTypes.join(`,`),
      },
    },
    page,
    per_page: 100,
  });
  const pageCount = Math.ceil(response.total / response.perPage);
  const storyResponses = await getMultiple({ ids: response.data.stories.map(x => x.id) });
  response.data.stories = storyResponses.map(x => x.data.story);

  return { pageCount, ...response };
}

function create({ story }) {
  return api.post(`spaces/${spaceId}/stories`, { story });
}

function update({ story }) {
  return api.put(`spaces/${spaceId}/stories/${story.id}`, { story, publish: true });
}

function createOrUpdate({ story }) {
  return story.id ? update({ story }) : create({ story });
}

module.exports = {
  create,
  createOrUpdate,
  get,
  list,
  update,
};
