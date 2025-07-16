export const STORAGES = {
  token: "token",
  id: "id",
  theme: "theme",
  formLinkClicked: "formLinkClicked",
  isInfoStripClosed: "isInfoStripClosed",
  referralCode: "referralCode",
};

export const SUPPORTED_THEMES = {
  light: "light",
  dark: "dark",
};

export const PalleteColorTypes = [
  "gradient",
  "primary",
  "secondary",
  "tertiary",
  "white",
  "black",
];

export const SUPPORTED_BLOCKCHAINS = {
  ethereum: "ethereum",
  avax: "avax",
};

export const SUPPORTED_ETHEREUM_NETWORKS = {
  sepolia: "sepolia",
  mainnet: "testnet",
};
export const SUPPORTED_AVAX_NETWORKS = {
  fujiC: "fujiC",
  mainnet: "avax",
};

export const SUPPORTED_NETWORKS = {
  [SUPPORTED_BLOCKCHAINS.avax]: {
    mainnet: {
      name: SUPPORTED_AVAX_NETWORKS.mainnet,
      chain_id: 43114,
    },
    sepolia: {
      name: SUPPORTED_AVAX_NETWORKS.fujiC,
      chain_id: 43113,
    },
  },
};

export const COMPONENT_SIZES = {
  X_SMALL: "x-small",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

export const SUPPORTED_SOCIAL_PLATFORMS = {
  twitter: "twitter",
  instagram: "instagram",
  tiktok: "tiktok",
  youtube: "youtube",
};

export const VALID_SOCIAL_PLATFORMS = [
  "twitter",
  "tiktok",
  "instagram",
  "youtube",
];

export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/png",
  "image/webp",
];

export const APP_SOCIAL_LINKS = {
  INSTAGRAM: "https://www.instagram.com/soshnft/",
  TWITTER: "https://twitter.com/SoshNFT",
  YOUTUBE: "https://www.youtube.com/channel/UCON-yDWn8cSJDyMkkGmT3mA",
  TIKTOK: "https://www.tiktok.com/@soshnft",
};

export const SUPPORT_MAIL_ADDRESS = "support@soshnft.io";

export const SUPPORTED_VIDEO_FORMATS = ["video/mp4", "video/webm"];
