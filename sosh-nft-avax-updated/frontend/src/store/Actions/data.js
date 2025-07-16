export const setValidateUrl = (data) => {
  return {
    type: "SETVALIDATEURL",
    data,
  };
};

export const setUserDetails = (data) => {
  return {
    type: "SETUSERADDRESS",
    data,
  };
};

export const setLink = (data) => {
  return {
    type: "SETLINK",
    data,
  };
};
export const setUIDLink = (data) => {
  return {
    type: "SETUID",
    data,
  };
};

export const setAssetDetail = (data) => {
  return {
    type: "SETASSETSDETAIL",
    data,
  };
};
export const setAssetDetails = (data) => {
  return {
    type: "SETASSETSDETAILS",
    data,
  };
};
export const setUserNameAvalability = (data) => {
  return {
    type: "USERNAMEAVALABLE",
    data,
  };
};
export const setMessage = (data) => {
  return {
    type: "SETMESSAGE",
    data,
  };
};

export const setLoading = () => {
  return {
    type: "SETLOADING",
  };
};
export const unSetLoading = () => {
  return {
    type: "UNSETLOADING",
  };
};

export const setAddresses = (address1, address2) => {
  return {
    type: "SETADDRESS",
    address1,
    address2,
  };
};
export const setLoginData = (data) => {
  return {
    type: "SETLOGINDATA",
    data,
  };
};

export const setAssects = (data) => {
  return {
    type: "SETASSETS",
    data,
  };
};
export const clearData = () => {
  return {
    type: "DISCONNECT",
  };
};
export const setAssectsById = (payload) => {
  return {
    type: "ASSETSBYID",
    payload,
  };
};
// setAssectsById;
export const setSearchData = (data) => {
  return {
    type: "SETSEARCHDATA",
    data,
  };
};
