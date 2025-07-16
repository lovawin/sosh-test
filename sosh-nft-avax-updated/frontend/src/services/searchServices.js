import getAxiosInst from "./axios";

const API_SUB_ENDPOINT = "assets/searchAssets/search";

export const getSearchResults = (search, searchType, platform) => {
  return getAxiosInst({ withAuth: true }).get(
    `${API_SUB_ENDPOINT}?search=${search}&searchType=${searchType}&platform=${platform}`
  );
};
