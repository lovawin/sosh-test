import axios from "axios";

import getConfig from "configs/config";

axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
const URL = getConfig().apiBaseUrl;

// Social media URL patterns
const SOCIAL_MEDIA_PATTERNS = {
  // Twitter pattern is handled separately for more flexibility
  instagram: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/[\w-]+/i,
  youtube: /^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/i,
  tiktok: /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/i
};

// Twitter-specific patterns for different URL formats
const TWITTER_PATTERNS = [
  /^(?:https?:\/\/)?(?:www\.)?(twitter\.com|x\.com)\/.+\/status\/\d+/i,  // Standard status URL
  /^(?:https?:\/\/)?(?:www\.)?(twitter\.com|x\.com)\/.+$/i  // More lenient fallback
];

export const validateLinkApi = (url, token, category) => {
  // Validate inputs
  if (!url || !token || !category) {
    throw new Error('Missing required parameters');
  }

  // URL validation and normalization
  let normalizedUrl = url.trim();
  
  // Remove any surrounding whitespace or quotes
  normalizedUrl = normalizedUrl.replace(/^["']|["']$/g, '');
  
  // Add protocol if missing
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Debug logging
  console.log('Validating URL:', {
    original: url,
    normalized: normalizedUrl,
    category
  });

  // Basic URL validation - skip for Twitter URLs since we'll validate them separately
  if (category !== 'twitter') {
    try {
      new URL(normalizedUrl);
    } catch (e) {
      console.error('URL parsing failed:', e);
      throw new Error(`Please enter a valid URL for ${category}`);
    }
  }

  // Social media platform-specific validation
  if (category === 'twitter') {
    // Accept any URL containing x.com or twitter.com
    if (!normalizedUrl.includes('x.com') && !normalizedUrl.includes('twitter.com')) {
      console.error('Twitter URL validation failed:', {
        url: normalizedUrl
      });
      throw new Error('Please enter a valid Twitter/X URL (must include x.com or twitter.com)');
    }
  } else {
    const pattern = SOCIAL_MEDIA_PATTERNS[category];
    if (pattern && !pattern.test(normalizedUrl)) {
      const examples = {
        instagram: 'https://instagram.com/p/ABC123',
        youtube: 'https://youtube.com/watch?v=ABC123 or https://youtu.be/ABC123',
        tiktok: 'https://tiktok.com/@username/video/123456789'
      };
      console.error('Social media pattern match failed:', {
        url: normalizedUrl,
        category,
        pattern: pattern.toString()
      });
      throw new Error(`Please enter a valid ${category} link. Example: ${examples[category]}`);
    }
  }

  const data = JSON.stringify({
    link: normalizedUrl,
  });

  const config = {
    method: "post",
    url: URL + `/social/${category}/validatelink`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  return axios(config)
    .then(function (response) {
      // Detailed response logging
      console.log('Twitter validation response:', {
        status: response?.status,
        statusText: response?.statusText,
        hasData: !!response?.data,
        dataType: response?.data ? typeof response.data : 'undefined',
        data: response?.data,
        headers: response?.headers
      });

      // Return the entire response object to let apiHandler handle it
      return response;
    })
    .catch(function (error) {
      // Enhanced error logging
      console.error('Twitter validation error:', {
        response: {
          data: error?.response?.data,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          headers: error?.response?.headers
        },
        request: {
          url,
          category,
          config: error?.config
        },
        error: {
          message: error?.message,
          name: error?.name,
          stack: error?.stack
        }
      });

      // Handle specific error cases
      if (error?.response?.status === 400) {
        throw new Error('Invalid social media link. Please check the URL and try again.');
      } else if (error?.response?.status === 401) {
        throw new Error('Authentication error. Please try logging in again.');
      } else if (error?.response?.status === 404) {
        throw new Error('Content not found. Please check if the post exists.');
      }

      // Throw the error with a user-friendly message
      throw error?.response?.data || error;
    });
};

export const createAssetsApi = (data, token, uid) => {
  const hashtag = !data.hashtag?.startsWith("#")
    ? `#${data.hashtag}`
    : data.hashtag;
  data = JSON.stringify({
    hashtag: hashtag,
    awsObjectId: uid.bucket_link.ETag,
    post_url: uid.Validate_URL,
    bucketUrl: uid.bucket_link.Location,
    platform_type: data.category,
    description: data.caption,
    name: data.title,
  });

  var config = {
    method: "post",
    url: URL + "/assets",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  return axios(config)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.error('Create assets error:', error?.response?.data || error);
      throw error?.response?.data || error;
    });
};

export const updateAssetApi = (data, token, Id) => {
  var config = {
    method: "put",
    url: URL + `/assets/${Id}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: { tx_data: data },
  };

  return axios(config)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.error('Update asset error:', error?.response?.data || error);
      throw error?.response?.data || error;
    });
};

export const deleteAssetApi = (token, Id) => {
  var config = {
    method: "delete",
    url: URL + `/assets/${Id}/deleteAsset`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  return axios(config)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.error('Delete asset error:', error?.response?.data || error);
      throw error?.response?.data || error;
    });
};
