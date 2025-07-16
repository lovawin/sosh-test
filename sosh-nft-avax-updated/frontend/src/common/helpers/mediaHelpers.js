import {
  SUPPORTED_IMAGE_FORMATS,
  SUPPORTED_VIDEO_FORMATS,
} from "constants/appConstants";

export const checkIfImgUrlVideoUrl = (
  str,
  supportedFormatTypes = ["image"]
) => {
  if (!str) return false;
  let supportedFormats = [];
  if (supportedFormatTypes.includes("image")) {
    supportedFormats = [
      ...supportedFormats,
      ...SUPPORTED_IMAGE_FORMATS.map((format) => format.split("/")[1]),
    ];
  }
  if (supportedFormatTypes.includes("video")) {
    supportedFormats = [
      ...supportedFormats,
      ...SUPPORTED_VIDEO_FORMATS.map((format) => format.split("/")[1]),
    ];
  }

  const regex = new RegExp(`[${supportedFormats.join("|")}]$`);

  return !!str.match(regex);
};

export const validateMedia = (value, mediaType = ["image"]) => {
  const supportedFormats = [];
  mediaType.forEach((type) => {
    if (type === "image") {
      supportedFormats.push(...SUPPORTED_IMAGE_FORMATS);
    } else if (type === "video") {
      supportedFormats.push(...SUPPORTED_VIDEO_FORMATS);
    }
  });

  return typeof value === "string" && value
    ? checkIfImgUrlVideoUrl(value, mediaType)
    : value
    ? supportedFormats.includes(value.type)
    : true;
};
