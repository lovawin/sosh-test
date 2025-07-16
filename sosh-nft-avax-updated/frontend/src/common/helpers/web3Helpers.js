import getConfig from "configs/config";
import { setProvider, setWeb3Instance } from "store/commonStore/actionCreator";
import Web3 from "web3";

export const reqAccountAndSignature = async (web3Instance, msg) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  if (!web3Instance) {
    throw new Error('Web3 instance not initialized');
  }

  if (!msg) {
    throw new Error('Signature message is required');
  }

  try {
    console.log('Requesting accounts from MetaMask...');
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    console.log('Account access granted:', accounts[0]);

    console.log('Requesting signature for message...');
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [web3Instance.utils.utf8ToHex(msg), accounts[0]],
    });

    if (!signature) {
      throw new Error('Signature not provided');
    }

    console.log('Signature obtained successfully');
    return [accounts[0], signature];
  } catch (error) {
    console.error('Error in reqAccountAndSignature:', error);
    if (error.code === 4001) {
      throw new Error('User rejected the request');
    }
    throw error;
  }
};

export const createWeb3Instance = () => {
  const provider = Web3.givenProvider || getConfig().web3ProviderFallbackUrl;
  if (!provider) {
    throw new Error('No Web3 provider available');
  }
  console.log('Creating Web3 instance with provider:', provider.constructor.name);
  return new Web3(provider);
};

export const parseBalance = (num) =>
  parseFloat((num / Math.pow(10, 18)).toFixed(4));

const getEthereumBalance = async (web3Instance, account) => {
  try {
    const ethBalance = await web3Instance.eth.getBalance(account);
    return parseBalance(ethBalance);
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    throw error;
  }
};

export const hexToNumber = (hex) => Web3.utils.hexToNumber(hex);

export const getBalance = async (web3Instance, account) => {
  if (!web3Instance || !account) {
    throw new Error('Web3 instance and account are required');
  }

  try {
    console.log('Fetching balances for account:', account);
    const balances = {};
    balances.eth = await getEthereumBalance(web3Instance, account);
    console.log('Balances fetched:', balances);
    return balances;
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
};

export const createProvider = () => {
  try {
    const provider = Web3.givenProvider;
    if (!provider) {
      console.warn('No Web3 provider found');
      return null;
    }
    console.log('Provider created successfully');
    return provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
};

export const initProviderAndWeb3Instance = ({ dispatch }) => {
  console.log('Initializing provider and Web3 instance...');
  const provider = createProvider();
  if (!provider) {
    throw new Error('Failed to create Web3 provider');
  }

  const web3Instance = createWeb3Instance();
  if (!web3Instance) {
    throw new Error('Failed to create Web3 instance');
  }

  dispatch(setWeb3Instance(web3Instance));
  dispatch(setProvider(provider));
  console.log('Provider and Web3 instance initialized successfully');
  return [web3Instance, provider];
};

export const getAccount = async (web3Instance) => {
  if (!web3Instance) {
    throw new Error('Web3 instance is required');
  }

  try {
    console.log('Getting accounts...');
    const accounts = await web3Instance.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      console.log('No accounts found');
      return "";
    }
    console.log('Account found:', accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error('Error getting account:', error);
    return "";
  }
};

export const getChainId = async (web3Instance) => {
  if (!web3Instance) {
    throw new Error('Web3 instance is required');
  }

  try {
    console.log('Getting chain ID...');
    const chainId = await web3Instance.eth.net.getId();
    console.log('Chain ID:', chainId);
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    throw error;
  }
};
