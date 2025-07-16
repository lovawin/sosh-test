import getAxiosInst from "./axios";

const API_SUB_ENDPOINT = "/auth";

export const loginApi = ({
  username,
  name,
  email,
  signature,
  message,
  referralCode,
}) => {
  var data = {
    signature: signature,
    message: message,
    username: username,
    name: name,
    email: email,
    referral: referralCode,
    // publicaddress: address,
  };
  return getAxiosInst().post(`${API_SUB_ENDPOINT}/login`, data);
};

export const getMessageApi = () => {
  return getAxiosInst().get(`${API_SUB_ENDPOINT}/message`);
};
