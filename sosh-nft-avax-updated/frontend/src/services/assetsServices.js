import { createQueryString } from "common/common";
import getAxiosInst from "./axios";

const API_SUB_ENDPOINT = "/assets";

const API_SUB_ENDPOINT_SUGGEST = "/user/suggesteduser/getUsers";

export const getAllPosts = ({ page = 1, limit = 12, ...queryParams } = {}) => {
  const queryString = createQueryString({
    ...queryParams,
    offset: page - 1,
    limit,
  });

  return getAxiosInst({ withAuth: true }).get(
    `${API_SUB_ENDPOINT}${queryString}`
  );
};

export const getAssetDetails = (
  id,
  { page = 1, limit = 10, ...queryParams } = {}
) => {
  const queryString = createQueryString({
    ...queryParams,
    offset: page - 1,
    limit,
  });
  return getAxiosInst({ withAuth: true }).get(
    `${API_SUB_ENDPOINT}/${id}${queryString}`
  );
};

export const getSuggestAccount = () => {
  return getAxiosInst({ withAuth: true }).get(`${API_SUB_ENDPOINT_SUGGEST}`);
};

export const getAssetsByOwner = (
  id,
  { page = 1, limit = 12, ...queryParams } = {}
) => {
  const queryString = createQueryString({
    ...queryParams,
    offset: page - 1,
    limit,
  });

  return getAxiosInst({ withAuth: true }).get(
    `${API_SUB_ENDPOINT}/owner/${id}${queryString}`
  );
};

export const getNftBid = ({ saleId, asset_id }) => {
  const queryString = createQueryString({ saleId, asset_id });
  console.log("saleid", saleId, asset_id);

  return getAxiosInst({ withAuth: true }).get(
    `${API_SUB_ENDPOINT}/auction${queryString}`
  );
};

export const addCommentOnAsset = (id, comment) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/${id}/comments`,
    { text: comment }
  );
};

export const deleteComment = (id) => {
  return getAxiosInst({ withAuth: true }).delete(
    `${API_SUB_ENDPOINT}/deleteComment/${id}`
  );
};
export const deleteAsset = (id) => {
  return getAxiosInst({ withAuth: true }).delete(
    `${API_SUB_ENDPOINT}/${id}/deleteAsset`
  );
};
export const likeComment = (id, type) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/${id}/comments/like`,
    { like: type }
  );
};
export const saleCreated = (data) => {
  console.log("data from api", data);
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/saleCreated`,
    { hash: data }
  );
};
export const updateSaleCreated = (data) => {
  console.log("data from api", data);
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/saleCreated`,
    { hash: data }
  );
};
export const placeBid = (data) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/placeBid`,
    data
  );
};

export const purchaseNft = (data) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/purchaseNFT`,
    { hash: data }
  );
};
export const likeAsset = (id, type) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/${id}/like`,
    { like: type }
  );
};
