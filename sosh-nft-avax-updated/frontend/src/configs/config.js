import {
  SUPPORTED_BLOCKCHAINS,
  SUPPORTED_ETHEREUM_NETWORKS,
  SUPPORTED_NETWORKS,
} from "constants/appConstants";

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const defaultConfig = {
  apiBaseUrl: isLocalhost 
    ? "http://localhost:5000/api/V1"  // Local development backend
    : "https://www.soshnft.io/api/V1", // Production backend
  sepoliaHashUrl: "https://testnet.avascan.info/blockchain/c/tx/",
  cacheRefetchTime: 1000 * 60 * 30,
  cacheVersion: 1, // should be equal to our app version
  currentChainId: SUPPORTED_NETWORKS[SUPPORTED_BLOCKCHAINS.avax].sepolia.chain_id, // Avalanche Fuji Testnet (43113)
  web3ProviderFallbackUrl: "https://api.avax-test.network/ext/bc/C/rpc" // Avalanche Fuji RPC
};

const getConfig = () => {
  const config = {
    ...defaultConfig,
    ...(window.__CONFIG__ || {}),
  };
  return config;
};

export default getConfig;
