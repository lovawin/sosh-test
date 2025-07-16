const initial_state = {
  data: {},
  userData: [],
  userName_avalability: {
    data: { registered: "" },
  },
  CID: {},
  Validate_URL: "",
  bucket_link: "",
  message: {},
  fAddress: "",
  sAddress: "",
  loginData: [],
  assets: {},
  assetDetails: {},
  assetDetailById: {},
  searchData: [],
  isUpdate: false,
};

export default function soshReducer(state = initial_state, action) {
  switch (action.type) {
    case "SETASSETSDETAIL": {
      return {
        ...state,
        assetDetailById: action.data,
      };
    }
    case "SETLOADING": {
      return {
        ...state,
        isUpdate: true,
      };
    }
    case "UNSETLOADING": {
      return {
        ...state,
        isUpdate: false,
      };
    }

    case "SETSEARCHDATA": {
      return {
        ...state,
        searchData: action.data,
      };
    }
    case "SETUSERADDRESS": {
      return {
        ...state,
        userData: action.data,
      };
    }
    case "USERNAMEAVALABLE": {
      return {
        ...state,
        userName_avalability: action.data,
      };
    }

    case "SETMESSAGE": {
      return {
        ...state,
        message: action.data,
      };
    }
    case "SETADDRESS": {
      return {
        ...state,
        fAddress: action.address1,
        sAddress: action.address2,
      };
    }

    case "SETLINK": {
      return {
        ...state,
        bucket_link: action.data,
      };
    }
    case "SETUID": {
      return {
        ...state,
        CID: action.data,
      };
    }
    case "SETASSETSDETAILS": {
      return {
        ...state,
        assetDetails: action.data,
      };
    }
    case "SETASSETS": {
      return {
        ...state,
        assets: action.data,
      };
    }

    case "SETVALIDATEURL": {
      return {
        ...state,
        Validate_URL: action.data,
      };
    }
    case "SETLOGINDATA": {
      return {
        ...state,
        loginData: action.data,
      };
    }
    case "DISCONNECT": {
      return {
        // ...state,
        data: {},
        userData: [],
        userName_avalability: {
          data: { registered: "" },
        },
        message: {},
        fAddress: "",
        sAddress: "",
      };
    }
    default:
      return initial_state;
  }
}
