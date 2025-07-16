import { ADD_ASSETS, RESET_ASSETS, SET_ASSETS } from "./actionTypes";

const initialCommonState = {
  assets: [],
};

export const assetsReducer = (state = initialCommonState, action = {}) => {
  switch (action.type) {
    case ADD_ASSETS:
      return {
        ...state,
        assets: [...state.items, ...action.payload],
      };

    case RESET_ASSETS:
      return {
        ...state,
        assets: [],
      };

    case SET_ASSETS:
      return {
        ...state,
        assets: action.payload,
      };

    default:
      return { ...state };
  }
};
