const queryOptions = (queries) => {
  const { search, searchOn, sortBy, order, page, limit } = queries;
  const query = {};
  if (search) {
    query[searchOn] = { $regex: search, $options: "i" }; // Case-insensitive search
  }

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = order === "desc" ? -1 : 1; // Determine sort order
  }

  const skip = (parseInt(page) - 1) * parseInt(limit); // Calculate skip value

  return { query, sortOptions, skip, limit, page };
};

module.exports = queryOptions;
