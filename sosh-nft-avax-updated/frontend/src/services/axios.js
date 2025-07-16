import Axios from "axios";
import { getLocalStorageItem } from "common/helpers/localStorageHelpers";
import getConfig from "configs/config";
import { STORAGES } from "constants/appConstants";

// let BASE_URL = "http://localhost:4000/api/V1";
let BASE_URL = getConfig().apiBaseUrl;

// if (process?.env?.NODE_ENV === "production") {
//   BASE_URL = getConfig().apiBaseUrl;
// }

const CancelToken = Axios.CancelToken;

export default function getAxiosInst(
  { withAuth, headers } = { withAuth: false }
) {
  const token = getLocalStorageItem(STORAGES.token);
  
  const config = {
    baseURL: BASE_URL,
    headers: {
      ...(withAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  };

  return Axios.create(config);
}

export const apiHandler = async (
  apiCall,
  { onSuccess, onError, final, onCancel } = {},
  options = { sync: false, shouldReturn: false }
) => {
  let response;
  try {
    const source = CancelToken.source();
    response = await apiCall(source);

    // Handle case where response is already an Axios response object
    if (response?.config && response?.status) {
      // Log the raw response for debugging
      console.log('apiHandler received axios response:', {
        status: response?.status,
        statusText: response?.statusText,
        hasData: !!response?.data,
        dataType: response?.data ? typeof response.data : 'undefined',
        data: response?.data,
        headers: response?.headers
      });

      // Check if response is successful (HTTP 2xx)
      if (response?.status >= 200 && response?.status < 300) {
        const data = response?.data;
        
        // Log success path
        console.log('apiHandler success path:', {
          hasData: !!data,
          dataType: typeof data,
          hasOnSuccess: !!onSuccess,
          sync: options?.sync
        });

        if (onSuccess && options.sync) onSuccess(data, options);
        else if (onSuccess) {
          await onSuccess(data, options);
        }
        return Promise.resolve(data || { success: true });
      }
    }
    
    // If we get here, either it's not an axios response or it's not successful
    console.log('apiHandler invalid response:', {
      isAxiosResponse: !!(response?.config && response?.status),
      status: response?.status,
      data: response?.data
    });

    throw new Error('Request failed');
  } catch (error) {
    console.error("API Error:", error);
    
    if (Axios.isCancel(error)) {
      onCancel && onCancel(error);
      console.error("Request canceled", error.message);
    } else {
      const errorResponse = error.response;
      let errorMessage = error.message;
      
      // Enhanced error handling for auth failures
      if (errorResponse?.status === 401) {
        console.error('Authentication failed:', errorResponse?.data?.message || 'Session expired');
        errorMessage = 'Authentication failed. Please try logging in again.';
      } else if (errorResponse?.data) {
        errorMessage = errorResponse.data.message || 
                      errorResponse.data.error || 
                      errorResponse.data.details ||
                      errorMessage;
      }

      if (errorMessage === "Some Error") {
        errorMessage = "An error occurred while validating the link. Please try again.";
      }

      error.message = errorMessage;
      onError && onError(error, errorResponse, options);
    }
    if (options.shouldReturn) return Promise.reject({ ...error, options });
  } finally {
    final && final(options);
  }
};
