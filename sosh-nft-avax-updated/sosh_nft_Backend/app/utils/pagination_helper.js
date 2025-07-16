module.exports = {
  getPagination: (query_params) => {
    const DEFAULT_OFFSET = 0;
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 100;

    let limit = Math.min(parseInt(query_params.limit || DEFAULT_LIMIT, 10), 100);

    // if a negative or a very high number is given, set it to the default value
    if (limit < 0 || limit > MAX_LIMIT) {
      limit = DEFAULT_LIMIT;
    }

    let offset = parseInt(query_params.offset || DEFAULT_OFFSET, 10) * limit;

    // if a negative or a very high number is given, set it to the default value
    if (offset < 0) {
      offset = DEFAULT_OFFSET * limit;
    }
    const createdAt = query_params.createdAt ? (query_params.createdAt === 'desc' ? -1 : 1) : 1;

    return {
      limit,
      offset,
      createdAt,
    };
  },
};
