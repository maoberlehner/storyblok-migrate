module.exports = async function unpaginate({
  cb,
  page = 1,
  params,
}) {
  const { data, pageCount } = await cb({ ...params, page });
  const result = [data];

  if (page >= pageCount) return result;

  const nextResult = await unpaginate({
    cb,
    page: page + 1,
    params,
  });

  return [...result, ...nextResult];
};
