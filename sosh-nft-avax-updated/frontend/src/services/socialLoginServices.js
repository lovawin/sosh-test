import getAxiosInst from "./axios";

const API_SUB_ENDPOINT = "/social";

export const twitterLoginApi = (token) => {
  return getAxiosInst().get(`${API_SUB_ENDPOINT}/twitter/login?auth_token=${token}`);
};

export const validateTwitterLink = (link) => {
  return getAxiosInst({ withAuth: true }).post(`${API_SUB_ENDPOINT}/twitter/validatelink`, { link });
};
