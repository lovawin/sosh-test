import { combineReducers } from "redux";
import { assetsReducer } from "store/assetsStore.js/reducer";
import { commonReducer } from "store/commonStore/reducer";
import loginReducer from "store/loginStore/reducer";
import { userReducer } from "store/userStore/reducer";
import data from "./data";

export default combineReducers({
  data: data,
  login: loginReducer,
  common: commonReducer,
  user: userReducer,
  assets: assetsReducer,
});
