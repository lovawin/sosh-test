import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Desc, SelectDiv, StyledSuggestions } from "./style";
import { setLoading, unSetLoading } from "../../store/Actions/data";
import { toast } from "react-toastify";
import { contactInstance } from "../../common/methodInstance";

import CustomButton from "components/CustomButton";
import TextInput from "components/formComponents/textInput";
import SelectInput from "components/formComponents/SelectInput";
import Chevron from "assets/icons/chevron";
import { SUPPORTED_SOCIAL_PLATFORMS } from "constants/appConstants";
import useQuery from "hooks/useQuery";
import useCreateNFTContext from "hooks/useCreateNFTContext";
import { apiHandler } from "services/axios";
import { createAssetsApi, deleteAssetApi, updateAssetApi } from "services/api";
import { useNavigate } from "react-router";
import Routes from "constants/routes";
import getConfig from "configs/config";
import { Overlay } from "react-bootstrap";
import { getSearchResults } from "services/searchServices";
import { getCountBasedText } from "common/helpers/textHelpers";
import { debounce } from "lodash";

const PLATFORM_OPTIONS = [
  {
    value: "twitter",
    label: "X (Twitter)",
  },
  {
    value: "youtube",
    label: "Youtube",
  },
  {
    value: "instagram",
    label: "Instagram",
  },

  {
    value: "tiktok",
    label: "Tiktok",
  },
];

const SelectElement = ({ value, placeholder, ...restProps }) => {
  return (
    <CustomButton as={"div"} color="gradient" {...restProps} outline>
      {value || placeholder} <Chevron />
    </CustomButton>
  );
};

function NFTDetail() {
  const token = useSelector((state) => state.login.token);
  const globalData = useSelector((state) => state.data);
  const { userData } = useSelector((state) => state?.user);
  const { query } = useQuery();
  const { formData, setFieldValue, resetForm } = useCreateNFTContext();
  const dispatch = useDispatch();
  const { address } = useSelector((state) => state.login);
  const navigate = useNavigate();
  const [assetData, setAssetData] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const suggestionTarget = useRef(null);
  const suggestionListRef = useRef(null);

  const isSuggestionSelected = useRef(null);

  const resetSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const searchHashtags = useCallback((tag) => {
    apiHandler(() => getSearchResults(tag, "asset"), {
      onSuccess: ({ result }) => {
        result = result.filter(({ hashtag }) => hashtag.startsWith(`#${tag}`));
        setSuggestions(result);
      },
    });
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(searchHashtags, 300),
    [searchHashtags]
  );

  useEffect(() => {
    let tag = formData.hashtag;
    if (tag.startsWith("#")) {
      tag = tag.slice(1);
    }

    if (!tag || isSuggestionSelected.current) {
      resetSuggestions();
    } else {
      debouncedSearch(tag);
    }
  }, [formData.hashtag, debouncedSearch, resetSuggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionListRef?.current &&
        !suggestionListRef?.current?.contains(event.target) &&
        suggestions?.length > 0
      ) {
        resetSuggestions();
      }
    }

    if (suggestions?.length > 0) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [resetSuggestions, suggestions]);

  useEffect(() => {
    if (query) {
      const platform = query?.get("platform");
      const supportedPlatforms = Object.values(SUPPORTED_SOCIAL_PLATFORMS);
      if (platform && supportedPlatforms.includes(platform)) {
        setFieldValue("category", platform);
      }
    }
  }, [query, dispatch, setFieldValue]);

  const getSelectedCategoryUsername = useCallback(
    (category) => {
      switch (category) {
        case SUPPORTED_SOCIAL_PLATFORMS.instagram:
          return userData?.instagramUsername;
        case SUPPORTED_SOCIAL_PLATFORMS.twitter:
          return userData?.twitterUsername;
        case SUPPORTED_SOCIAL_PLATFORMS.youtube:
          return userData?.youtubeUsername;

        case SUPPORTED_SOCIAL_PLATFORMS.tiktok:
          return userData?.tiktokUsername;
        default:
          return "";
      }
    },
    [userData]
  );
  const deleteAsset = useCallback(
    async (assetDetails) => {
      console.log("assetDetails from delete", assetDetails);
      try {
        dispatch(setLoading());

        const assetId = assetDetails?._id;
        apiHandler(() => deleteAssetApi(token, assetId), {
          onSuccess: () => {
            // toast("Post created successfully", {
            //   type: "success",
            // });
            resetForm();
            // navigate(Routes.home);
          },
          onError: (error) => {
            console.error(error);
            // toast("Post creation failed!", {
            //   type: "error",
            // });
          },
          final: () => {
            dispatch(unSetLoading());
          },
        });
      } catch (error) {
        console.log("error  from creation", error);

        if (error) {
        }
        if (error?.message && typeof error?.message === "string") {
          toast(error?.message, {
            type: "error",
          });
        }
        dispatch(unSetLoading());
      }
    },
    [dispatch, token, resetForm]
  );

  const requestMinting = useCallback(
    async (assetDetails) => {
      try {
        dispatch(setLoading());
        const Contract = contactInstance();
        console.log("Contract", Contract);
        const mintFee = await Contract.methods.mintFee().call();
        console.log("mintFee", mintFee);
        const mint = await Contract.methods
          .mintWithRoyalty(address, assetDetails?.metadata_url)
          .send({ from: address, value: mintFee });
        const assetId = assetDetails?._id;
        apiHandler(() => updateAssetApi(mint, token, assetId), {
          onSuccess: () => {
            toast("Post created successfully", {
              type: "success",
            });
            resetForm();
            navigate(Routes.home);
          },
          onError: (error) => {
            console.error(error);
            toast("Post creation failed!", {
              type: "error",
            });
          },
          final: () => {
            dispatch(unSetLoading());
          },
        });
      } catch (error) {
        deleteAsset(assetDetails);

        console.log("error  from creation", error);
        if (error?.message && typeof error?.message === "string") {
          toast(error?.message, {
            type: "error",
          });
        }
        dispatch(unSetLoading());
      }
    },
    [dispatch, address, token, resetForm, navigate, deleteAsset]
  );

  const handleCreate = () => {
    // Debug logs to check globalData values
    console.log("Checking globalData values:");
    console.log("globalData:", globalData);
    console.log("bucket_link:", globalData?.bucket_link);
    console.log("bucket_link ETag:", globalData?.bucket_link?.ETag);
    console.log("bucket_link Location:", globalData?.bucket_link?.Location);
    console.log("Validate_URL:", globalData?.Validate_URL);

    if (formData.category === "") {
      toast("Please Select Category", {
        type: "error",
      });
      return;
    }
    if (formData.title === "") {
      toast("Please Enter Title", {
        type: "error",
      });
      return;
    }
    if (formData.title === "") {
      toast("Link Not Verified", {
        type: "error",
      });
      return;
    }
    if (formData.caption === "") {
      toast("Please Enter Caption", {
        type: "error",
      });
      return;
    }
    if (formData.hashtag === "") {
      toast("Please Enter Hashtag", {
        type: "error",
      });
      return;
    }
    if (globalData.Validate_URL === "") {
      toast("Link Not Verified", {
        type: "error",
      });
      return;
    }
    dispatch(setLoading());
    if (!assetData?._id) {
      apiHandler(() => createAssetsApi(formData, token, globalData), {
        onSuccess: (response) => {
          setAssetData(response?.asset || {});
          requestMinting(response.asset);
          console.log("response----->>>>>>>", response);
          toast("Asset Created Successfully", {
            type: "success",
          });
        },
        onError: (error) => {
          console.error(error);
          toast("Asset Creation Failed", { type: "error" });
          dispatch(unSetLoading());
        },
      });
    } else {
      requestMinting(assetData);
    }
  };

  useEffect(() => {
    const selectedCategoryUsername = getSelectedCategoryUsername(
      formData?.category
    );

    if (token && formData.category && !selectedCategoryUsername) {
      window.location.href = `${getConfig().apiBaseUrl}/social/${
        formData.category
      }/login?auth_token=${token}`;
    }
  }, [formData, token, getSelectedCategoryUsername]);

  const handleSelect = (value) => {
    setFieldValue("category", value);
  };

  const handleChange = (e) => {
    setFieldValue(e.target.name, e.target.value);
  };

  const handleHashtagChange = (e) => {
    isSuggestionSelected.current = false;
    handleChange(e);
  };

  const suggestionClickHandler = useCallback(
    ({ hashtag }) => {
      isSuggestionSelected.current = true;
      resetSuggestions();
      setFieldValue("hashtag", hashtag);
    },
    [resetSuggestions, setFieldValue]
  );

  return (
    <Form>
      <h2 className="section-heading">NFT Details</h2>
      <Desc>
        Complete the following details before your post is listed on the
        marketplace.
      </Desc>

      <div className="fields-wrap">
        <div className="form-group">
          <TextInput
            onChange={handleChange}
            name="title"
            value={formData.title}
            placeholder="Title"
          />
        </div>

        <SelectDiv className="form-group">
          <SelectInput
            inputElement={SelectElement}
            initialValue={formData.category}
            placeholder="Select Category"
            options={PLATFORM_OPTIONS}
            onSingleSelect={handleSelect}
          />
          <Desc className="helper-text">
            Add category on your post and make users easy to find your post.
          </Desc>
        </SelectDiv>

        <div className="form-group">
          <TextInput
            outline
            as="textarea"
            id="w3review"
            placeholder="Enter Caption"
            rows={4}
            cols="50"
            onChange={handleChange}
            name="caption"
            value={formData.caption}
          />
        </div>

        <div className="form-group" ref={suggestionTarget}>
          <Overlay
            target={suggestionTarget.current}
            show={Boolean(suggestions?.length)}
            placement="top-start"
          >
            {({ style, ...props }) => (
              <StyledSuggestions
                {...props}
                style={{
                  position: "absolute",
                  ...style,
                }}
              >
                <ul ref={suggestionListRef}>
                  {suggestions?.map(({ hashtag, postCount }, i) => (
                    <li
                      key={`${hashtag}-${i}`}
                      onClick={() => suggestionClickHandler({ hashtag })}
                    >
                      <span>{hashtag}</span>
                      <span className="post-count">
                        {getCountBasedText(postCount, "post", true)}
                      </span>
                    </li>
                  ))}
                </ul>
              </StyledSuggestions>
            )}
          </Overlay>
          <TextInput
            onChange={handleHashtagChange}
            autoComplete="off"
            name="hashtag"
            value={formData.hashtag}
            placeholder="Add Hashtags"
          />
        </div>

        <CustomButton
          className="create-button"
          color="gradient"
          onClick={handleCreate}
        >
          Create Item
        </CustomButton>
      </div>
    </Form>
  );
}

export default NFTDetail;
