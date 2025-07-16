import { useEffect, useState } from "react";
import InstagramIcon from "assets/icons/instagramIcon";
import TwitterIcon from "assets/icons/twitterIcon";
import YoutubeIcon from "assets/icons/youtubIcon";
import CustomButton from "components/CustomButton";
import TextInput from "components/formComponents/textInput";
import ImageComponent from "components/ImageComponent";
import useCreateNFTContext from "hooks/useCreateNFTContext";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { validateLinkApi } from "services/api";
import { apiHandler } from "services/axios";
import { setLink, setValidateUrl } from "../../store/Actions/data";
import {
  Form,
  ImgDiv,
  Div,
  ButtonDiv,
  Data,
  Label,
  Desc,
  ButtonHollow,
  CheckBox,
  ErrorMessage,
} from "./style";
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  VALID_SOCIAL_PLATFORMS,
} from "../../constants/appConstants";
import TiktokIcon from "assets/icons/tiktokIcon";
import { useNavigate } from "react-router";

const PLATFORM_LIST = [
  {
    name: "X (Twitter)",
    key: SUPPORTED_SOCIAL_PLATFORMS.twitter,
    icon: TwitterIcon,
  },
  {
    name: "youtube",
    key: SUPPORTED_SOCIAL_PLATFORMS.youtube,
    icon: YoutubeIcon,
  },
  {
    name: "Instagram",
    key: SUPPORTED_SOCIAL_PLATFORMS.instagram,
    icon: InstagramIcon,
  },
  {
    name: "TikTok",
    key: SUPPORTED_SOCIAL_PLATFORMS.tiktok,
    icon: TiktokIcon,
  },
];

const PLATFORM_EXAMPLES = {
  twitter: 'https://x.com/username/status/123... or https://twitter.com/username/status/123...',
  instagram: 'https://instagram.com/p/ABC123...',
  youtube: 'https://youtube.com/watch?v=ABC123...',
  tiktok: 'https://tiktok.com/@username/video/123...'
};

function CreatePost() {
  const [src, setSrc] = useState("");
  const [show, setShow] = useState(true);
  const { formData, setFieldValue } = useCreateNFTContext();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.login.token);
  const buccket_link = useSelector((state) => state.data.bucket_link.Location);

  const handlesAdd = (e) => {
    // Clean and normalize URL
    const trimmedUrl = src?.trim().replace(/\s+/g, ''); // Remove all whitespace

    // Validate category first
    if (!formData.category) {
      toast.error("Please select a social media platform first", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    // Validate URL presence
    if (!trimmedUrl) {
      toast.error(`Please enter a ${formData.category} link (e.g., ${PLATFORM_EXAMPLES[formData.category]})`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    // Add protocol if missing
    let urlToValidate = trimmedUrl;
    if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
      urlToValidate = 'https://' + urlToValidate;
    }

    dispatch(setValidateUrl(urlToValidate));
    setVerifying(true);
    apiHandler(() => validateLinkApi(urlToValidate, token, formData.category), {
      onSuccess: (res) => {
        toast(
          res?.message && typeof res?.message === "string"
            ? res?.message
            : "Link verified successfully!",
          {
            type: "success",
          }
        );
        setShow(false);
        dispatch(setLink(res));
        setSrc("");
      },
      onError: async (err) => {
        // Get user-friendly error message
        let errorMessage = err?.message;
        if (errorMessage === "Some Error" || !errorMessage) {
          errorMessage = `Invalid ${formData.category} link. Example format: ${PLATFORM_EXAMPLES[formData.category]}`;
        }

        // Show error toast with specific message
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setShow(true);
      },
      final: () => {
        setVerifying(false);
      },
    });
  };

  useEffect(() => {
    setSrc(buccket_link);
  }, [buccket_link]);

  return (
    <>
      <Form>
        <h2 className="section-heading">Create New Post</h2>

        {show ? (
          <div className="fields-wrap">
            <div className="form-group">
              <TextInput
                name="link"
                onChange={(e) => {
                  setSrc(e.target.value);
                }}
                value={src}
                placeholder={formData.category 
                  ? `Paste your ${formData.category} link (e.g., ${PLATFORM_EXAMPLES[formData.category]})`
                  : "Select a platform and paste your social media link"}
              />
            </div>

            <div className="helper-message-wrap">
              <p className="message">
                {formData.category 
                  ? `Add your ${formData.category} post link (e.g., ${PLATFORM_EXAMPLES[formData.category]})`
                  : 'Select a social media platform and add your post link'}
              </p>
              <Div
                className="icons-wrap"
                style={{ float: "right", marginLeft: "2px", color: "gray" }}
              >
                {PLATFORM_LIST?.map(({ key, icon: Icon }) => {
                  return (
                    <span
                      key={key}
                      onClick={() => {
                        if (VALID_SOCIAL_PLATFORMS?.includes(key)) {
                          setFieldValue("category", key);
                        } else {
                          navigate("/coming-soon");
                        }
                      }}
                      role="button"
                      className={`icon-wrap${
                        formData.category === key ? " active" : ""
                      }`}
                    >
                      <Icon className="icon" />
                    </span>
                  );
                })}
              </Div>
            </div>
            <CustomButton
              loading={verifying}
              disabled={verifying}
              onClick={handlesAdd}
              className="link-verify-button"
              color={"gradient"}
            >
              Add
            </CustomButton>
          </div>
        ) : (
          <ImgDiv>
            {buccket_link ? (
              <ImageComponent freeSize src={src} placeholder="Title" />
            ) : (
              <Spinner
                style={{ backgroundColor: "#005BEA" }}
                animation="grow"
              />
            )}
          </ImgDiv>
        )}
      </Form>
    </>
  );
}

export default CreatePost;
