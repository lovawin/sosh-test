import {
  STORAGES,
  SUPPORTED_BLOCKCHAINS,
  SUPPORTED_NETWORKS,
} from "constants/appConstants";
import { getLocalStorageItem } from "./helpers/localStorageHelpers";
import jwtDecode from "jwt-decode";
import getConfig from "configs/config";

// a function to check if jwt token is expired or not
export const isJwtExpired = (token) => {
  if (typeof token !== "string" || !token)
    throw new Error("Invalid token provided");

  let isJwtExpired = false;
  const { exp } = jwtDecode(token);
  const currentTime = new Date().getTime() / 1000;

  if (currentTime > exp) isJwtExpired = true;

  return isJwtExpired;
};

export const checkIfLogin = () => {
  const token = getLocalStorageItem(STORAGES.token);
  return !!token && !isJwtExpired(token);
};

/**
 * a function to create query string from object
 * @param {object} queryObject
 * @returns {string}
 */

export const createQueryString = (queryObject = {}) => {
  const newQueryObj = { ...queryObject };
  const queryNames = Object.keys(newQueryObj);
  const params = new URLSearchParams();

  queryNames.forEach((queryName) => {
    if (
      newQueryObj[queryName] !== undefined &&
      newQueryObj[queryName] !== null
    ) {
      if (Array.isArray(newQueryObj[queryName])) {
        newQueryObj[queryName].forEach((value) =>
          params.append(queryName, value)
        );
      } else {
        params.append(queryName, newQueryObj[queryName]);
      }
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getCurrentNetworkName = () => {
  const currentChainId = getConfig().currentChainId;
  console.log("currentChainId", currentChainId);
  const network = Object.values(
    SUPPORTED_NETWORKS[SUPPORTED_BLOCKCHAINS.avax]
  ).find((network) => network.chain_id === currentChainId);
  return network?.name;
};

export const copyToClipboard = async ({ text = "", onSuccess, onError }) => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess && onSuccess();
  } catch (error) {
    console.error(error);
    onError && onError();
  }
};
