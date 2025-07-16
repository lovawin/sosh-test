import getAxiosInst from "./axios";

const API_SUB_ENDPOINT = "/user";

export const getUserApi = (address) => {
  const add = address.toLowerCase();

  return getAxiosInst().get(
    `${API_SUB_ENDPOINT}/getUserByWalletAddress/${add}`
  );
};
export const getConfigTime = () => {
  return getAxiosInst({ withAuth: true }).get(`${API_SUB_ENDPOINT}/getConfig`);
};

export const getUserNameApi = (userName) => {
  return getAxiosInst().get(
    `${API_SUB_ENDPOINT}/checkusername?username=${userName}`
  );
};

export const getUserById = (id) => {
  return getAxiosInst({ withAuth: true }).get(
    `${API_SUB_ENDPOINT}/getuserdetails/${id}`
  );
};
export const deleteComment = (id) => {
  return getAxiosInst({ withAuth: true }).get(`${API_SUB_ENDPOINT}/${id}`);
};

export const deleteUser = () => {
  return getAxiosInst({ withAuth: true }).delete(`${API_SUB_ENDPOINT}/delete`);
};

export const followUser = (id) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/follow/${id}`
  );
};

export const unfollowUser = (id, token) => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/unfollow/${id}`
  );
};

export const uploadProfileImage = (img) => {
  var data = new FormData();
  data.append("image", img);

  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/updateprofileimage`,
    data
  );
};

export const deleteProfileImage = () => {
  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/removeprofileimage`
  );
};

export const updateUserProfile = (data, token) => {
  data = {
    ...data,
    email: data.privateEmail,
  };

  return getAxiosInst({ withAuth: true }).post(
    `${API_SUB_ENDPOINT}/updateUser`,
    data
  );
};
