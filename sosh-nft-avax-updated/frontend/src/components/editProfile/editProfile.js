import React, { useCallback, useEffect, useState } from "react";
import { Form, ImgDiv, InputImg, Div } from "./style";

import { useDispatch, useSelector } from "react-redux";

import TextInput from "components/formComponents/textInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { validateMedia } from "common/helpers/mediaHelpers";
import Avatar from "components/Avatar/Avatar";
import CustomButton from "components/CustomButton";

import { convertPxToRem } from "common/helpers";
import { apiHandler } from "services/axios";
import {
  deleteProfileImage,
  updateUserProfile,
  uploadProfileImage,
} from "services/userServices";
import { toast } from "react-toastify";
import { setUserData } from "store/userStore/actionCreators";
import { isValidUrlRegex } from "common/regex";

const FORM_FIELDS = {
  name: "name",
  username: "username",
  privateEmail: "privateEmail",
  website: "website",
  bio: "bio",
  twitter: "twitter",
  insta: "insta",
  youtube: "youtube",
  tiktok: "tiktok",
  address: "address",
  image: "image",
};

const validationSchema = Yup.object().shape({
  [FORM_FIELDS.name]: Yup.string().required("Name is required"),
  [FORM_FIELDS.username]: Yup.string().required("username is required"),
  [FORM_FIELDS.privateEmail]: Yup.string().email("Invalid email address"),
  [FORM_FIELDS.website]: Yup.string().matches(isValidUrlRegex, {
    message: "Invalid website url",
    excludeEmptyString: true,
  }),
  [FORM_FIELDS.bio]: Yup.string(),
  [FORM_FIELDS.twitter]: Yup.string(),
  [FORM_FIELDS.insta]: Yup.string(),
  [FORM_FIELDS.youtube]: Yup.string(),
  [FORM_FIELDS.tiktok]: Yup.string(),
  [FORM_FIELDS.address]: Yup.string(),
  [FORM_FIELDS.image]: Yup.mixed().test(
    "fileFormat",
    "unsupported file",
    (value) => validateMedia(value, ["image"])
  ),
});

function EditProfileUI() {
  const { userData } = useSelector((state) => state.user);
  const {
    register,
    setValue,
    handleSubmit,

    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const [imageUrl, setImageUrl] = useState(null);
  const [isImageLoading, setImageLoading] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const dispatch = useDispatch();

  const startImageLoading = useCallback(() => {
    setImageLoading(true);
  }, []);

  const stopImageLoading = useCallback(() => {
    setImageLoading(false);
  }, []);

  const startUpdating = useCallback(() => {
    setUpdating(true);
  }, []);

  const stopUpdating = useCallback(() => {
    setUpdating(false);
  }, []);

  useEffect(() => {
    if (userData) {
      setImageUrl(userData.profile_image_url);
      reset({
        [FORM_FIELDS.name]: userData.name,
        [FORM_FIELDS.username]: userData.username,
        [FORM_FIELDS.privateEmail]: userData.email,
        [FORM_FIELDS.website]: userData.website,
        [FORM_FIELDS.bio]: userData.bio,
        [FORM_FIELDS.twitter]: userData.twitterUsername,
        [FORM_FIELDS.insta]: userData.instagramUsername,
        [FORM_FIELDS.youtube]: userData.youtubeUsername,
        [FORM_FIELDS.tiktok]: userData.tictokUsername,
        [FORM_FIELDS.address]: userData.wallet_address,
        [FORM_FIELDS.image]: userData.profile_image_url,
      });
    }
  }, [userData, reset]);

  const imageChangeHandler = (event) => {
    const fileUploaded = event.target.files[0];
    const imgSrc = URL.createObjectURL(event.target.files[0]);
    const img = event.target.files[0];

    if (fileUploaded) {
      startImageLoading();
      apiHandler(() => uploadProfileImage(img), {
        onSuccess: (result) => {
          dispatch(setUserData(result?.data));
          toast("Profile image updated successfully.", {
            type: "success",
          });
        },
        onError: () => {
          toast("Profile image updation failed!", {
            type: "error",
          });
        },
        final: () => {
          stopImageLoading();
        },
      });
    }

    setValue(FORM_FIELDS.image, img);
    setImageUrl(imgSrc);
  };

  const handleDelete = async () => {
    startImageLoading();
    apiHandler(deleteProfileImage, {
      onSuccess: (result) => {
        dispatch(setUserData(result?.data));
        toast("Profile image deleted successfully.", {
          type: "success",
        });
      },
      onError: () => {
        toast("Profile image deletion failed!", {
          type: "error",
        });
      },
      final: () => {
        stopImageLoading();
      },
    });
  };

  const submitHandler = (values) => {
    startUpdating();
    apiHandler(() => updateUserProfile(values), {
      onSuccess: (result) => {
        dispatch(setUserData(result?.data));
        toast("Profile updated successfully.", {
          type: "success",
        });
      },
      onError: () => {
        toast("Profile updation failed!", {
          type: "error",
        });
      },
      final: () => {
        stopUpdating();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit(submitHandler)}>
      <Div>
        <ImgDiv>
          <Avatar
            $width={convertPxToRem(110)}
            $height={convertPxToRem(110)}
            loading={isImageLoading}
            $imgURL={imageUrl}
          />

          <div className="buttons-wrap">
            <CustomButton as="label" color="gradient" htmlFor="Id">
              {imageUrl ? "Change Image" : "Upload Image"}
            </CustomButton>
            <InputImg
              name=""
              type="file"
              accept="image/png, image/gif, image/jpeg, image/jpg"
              onChange={imageChangeHandler}
              id="Id"
              hidden
            />
            {imageUrl ? (
              <CustomButton color="gradient" outline onClick={handleDelete}>
                Delete
              </CustomButton>
            ) : null}
          </div>
        </ImgDiv>
      </Div>

      <div className="form-group">
        <TextInput
          error={errors[FORM_FIELDS.name]?.message}
          placeholder="First Name"
          helperText="You can enter your full name, business name, or brand name."
          {...register(FORM_FIELDS.name)}
        />
      </div>

      <div className="form-group">
        <TextInput
          error={errors[FORM_FIELDS.username]?.message}
          maxLength="20"
          disabled={true}
          placeholder="Username"
          helperText="Your username"
          {...register(FORM_FIELDS.username)}
        />
      </div>

      <div className="form-group">
        <TextInput
          as={"textarea"}
          outline
          rows={3}
          placeholder="Account Bio"
          {...register(FORM_FIELDS.bio)}
        />
      </div>

      <div className="form-group">
        <TextInput
          disabled
          outline
          placeholder="Wallet Address:"
          helperText="Our account ownership is controlled by your wallet. The above wallet address currently controls access to your account."
          {...register(FORM_FIELDS.address)}
        />
      </div>

      <div className="form-group">
        <TextInput
          name="privateEmail"
          type="email"
          label="Private Email :"
          containerClass="email-field"
          placeholder="(e.g. example@mail.com)"
          error={errors[FORM_FIELDS.privateEmail]?.message}
          helperText="This is where push notifications and account updates will be sent."
          {...register(FORM_FIELDS.privateEmail)}
        />
      </div>

      <div className="form-group">
        <TextInput
          name="website"
          placeholder="(e.g. www.example.com)"
          label="Website :"
          containerClass="website-field"
          helperText="Add your website"
          error={errors[FORM_FIELDS.website]?.message}
          {...register(FORM_FIELDS.website)}
        />
      </div>

      <div className="form-group">
        <TextInput
          disabled
          name="twitter"
          placeholder="X (Twitter) Username"
          helperText="Add your X (Twitter)"
          {...register(FORM_FIELDS.twitter)}
        />
      </div>

      <div className="form-group">
        <TextInput
          disabled
          name="insta"
          placeholder="Instagram Username"
          helperText="Add your Instagram"
          {...register(FORM_FIELDS.insta)}
        />
      </div>

      <div className="form-group">
        <TextInput
          disabled
          name="youtube"
          placeholder="YouTube Username"
          helperText="Add your YouTube"
          {...register(FORM_FIELDS.youtube)}
        />
      </div>

      <div className="form-group">
        <TextInput
          disabled
          name="tiktok"
          placeholder="Tiktok Username"
          helperText="Add your Tiktok"
          {...register(FORM_FIELDS.tiktok)}
        />
      </div>

      <CustomButton
        loading={isUpdating}
        disabled={isUpdating}
        color="gradient"
        className="edit-submit-button"
        loadingContent="Saving..."
        type="submit"
      >
        Save
      </CustomButton>
    </Form>
  );
}

export default EditProfileUI;
