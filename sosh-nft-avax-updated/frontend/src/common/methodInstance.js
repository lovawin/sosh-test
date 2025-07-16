import Web3 from "web3";
import { CUSTOM_TOKEN_ADDRESS_721, CUSTOM_TOKEN_ABI_721 } from "./config721";
import { CUSTOM_TOKEN_ABI_721_MARKET_PLACE, CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE } from "./config721MarketPlace";


export function contactInstance() {
  const web3 = new Web3(Web3.givenProvider);
  return new web3.eth.Contract(CUSTOM_TOKEN_ABI_721, CUSTOM_TOKEN_ADDRESS_721);
}

export function marketPlaceInstance() {
  const web3 = new Web3(Web3.givenProvider);
  return new web3.eth.Contract(
    CUSTOM_TOKEN_ABI_721_MARKET_PLACE,
    CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE
  );
}
