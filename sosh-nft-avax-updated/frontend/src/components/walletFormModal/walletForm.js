import React, { useEffect, useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { Div, CheckDiv, StyledRegisterModal } from "./style";
import { useDispatch, useSelector } from "react-redux";

import { Form, FormGroup } from "react-bootstrap";
import TextInput from "components/formComponents/textInput";
import Routes from "constants/routes";
import * as Yup from "yup";
import { apiHandler } from "services/axios";
import { getUserNameApi } from "services/userServices";
import { login } from "store/loginStore/actions";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Checkbox from "components/formComponents/checkbox";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import CustomButton from "components/CustomButton";
import {
  getItemFromSession,
  setItemToSession,
} from "common/helpers/sessionStorageHelpers";
import { STORAGES } from "constants/appConstants";

const FORM_FILEDS = {
  name: "name",
  username: "username",
  email: "email",
  validAge: "validAge",
  termsAcceptance: "termsAcceptance",
  referralCode: "referralCode",
  contractAcceptance: "contractAcceptance",
};

const validationSchema = Yup.object().shape({
  [FORM_FILEDS.name]: Yup.string().required("Name is required"),
  [FORM_FILEDS.username]: Yup.string().required("Username is required"),
  [FORM_FILEDS.email]: Yup.string()
    .email("Enter Email in correct format")
    .required("Email is required"),
  [FORM_FILEDS.validAge]: Yup.boolean().oneOf(
    [true],
    "You must be at least 18 years old"
  ),
  [FORM_FILEDS.referralCode]: Yup.string(),
  [FORM_FILEDS.termsAcceptance]: Yup.boolean().oneOf(
    [true],
    "You must accept terms of service"
  ),
  [FORM_FILEDS.contractAcceptance]: Yup.boolean().oneOf(
    [true],
    "You must accept purchaser creator agreement."
  ),
});

function WalletForm({ show, onHide, ...restProps }) {
  const [isReferral, setIsReferral] = useState(false);
  const {
    account: address,
    signature,
    message,
  } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    control,
    clearErrors,
    getFieldState,
    setError,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const usernameValue = watch(FORM_FILEDS.username);

  const dispatch = useDispatch();

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const termsLinkClickHandler = () => {
    setItemToSession(STORAGES.formLinkClicked, true);
    onHide && onHide();
  };

  useEffect(() => {
    const referralCode = getItemFromSession(STORAGES.referralCode);
    setIsReferral(referralCode ? true : false);
    if (referralCode && show) {
      setValue(FORM_FILEDS.referralCode, referralCode);
    }
  }, [setValue, show]);

  const handleSignIn = async (values) => {
    const { name, username, email, referralCode } = values;

    try {
      startLoading();
      dispatch(
        login({
          username,
          name,
          email,
          signature,
          message,
          account: address,
          referralCode,
        })
      )
        .then((res) => {
          hideModal();
        })
        .catch((err) => {
          console.error("error in login", err, err?.message);

          // toast(err?.message, {
          //   type: "error",
          //   position: "top-right",
          // });
        });
    } catch (e) {
      console.error("error in handleSignIn", e);
    } finally {
      stopLoading();
    }
  };

  const hideModal = () => {
    onHide && onHide();
  };

  const usernameChangeHandler = useCallback(
    (username) => {
      const isTouched = getFieldState(FORM_FILEDS.username).isTouched;

      if (isTouched) {
        apiHandler(() => getUserNameApi(username), {
          onSuccess: (data) => {
            if (
              data?.status === "success" ||
              data?.message === "Username is available"
            ) {
              clearErrors(FORM_FILEDS.username);
            } else {
              setError(FORM_FILEDS.username, {
                type: "manual",
                message: "Username is already taken",
              });
            }
          },
          onError: (error) => {
            console.error(error);
            setError(FORM_FILEDS.username, {
              type: "manual",
              message: "Username is already taken",
            });
          },
        });
      }
    },
    [clearErrors, getFieldState, setError]
  );

  const debouncedUsernameChangeHandler = useMemo(
    () => debounce(usernameChangeHandler, 500),
    [usernameChangeHandler]
  );

  useEffect(() => {
    debouncedUsernameChangeHandler(usernameValue);
  }, [usernameValue, debouncedUsernameChangeHandler]);

  return (
    <StyledRegisterModal
      show={show}
      onHide={hideModal}
      showCloseButton
      title="Create Account"
      {...restProps}
    >
      <div className="address-wrapper">
        <p className="address">{address}</p>
      </div>
      <Form onSubmit={handleSubmit(handleSignIn)}>
        <FormGroup>
          <TextInput
            helperText="Enter Your Full Name"
            autoComplete="off"
            error={errors[FORM_FILEDS.name]?.message}
            placeholder="Name"
            defaultValue=""
            {...register(FORM_FILEDS.name)}
          />{" "}
        </FormGroup>
        <FormGroup>
          <TextInput
            helperText="Enter Your UserName"
            autoComplete="off"
            placeholder="Username"
            error={errors[FORM_FILEDS.username]?.message}
            defaultValue=""
            {...register(FORM_FILEDS.username)}
          />
        </FormGroup>
        <FormGroup>
          <TextInput
            helperText="Enter Your Email"
            autoComplete="off"
            placeholder="Email"
            error={errors[FORM_FILEDS.email]?.message}
            defaultValue=""
            {...register(FORM_FILEDS.email)}
          />
        </FormGroup>

        <FormGroup>
          <TextInput
            helperText="Referral Code (If Any)"
            autoComplete="off"
            placeholder="Referral Code"
            error={errors[FORM_FILEDS.referralCode]?.message}
            defaultValue=""
            disabled={isReferral}
            {...register(FORM_FILEDS.referralCode)}
          />
        </FormGroup>

        <p className="footer-message">
          Please take a few minutes to read and understand{" "}
          <NavLink onClick={termsLinkClickHandler} to={Routes.termsOfService}>
            Sosh Terms of Service.
          </NavLink>{" "}
          and &nbsp;
          <NavLink onClick={termsLinkClickHandler} to={Routes.about}>
            Purchaser Creator Agreement.
          </NavLink>{" "}
          To continue, you’ll need to accept the Terms of Service by checking
          the box.
        </p>
        <br />
        <Div>
          <CheckDiv>
            <Controller
              name={FORM_FILEDS.validAge}
              defaultValue={false}
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I am at least 18 year old"
                  id={field?.name}
                  error={errors[FORM_FILEDS.validAge]?.message}
                  {...field}
                />
              )}
            />
          </CheckDiv>
          <CheckDiv>
            <Controller
              name={FORM_FILEDS.termsAcceptance}
              defaultValue={false}
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I accept the Sosh Terms of Service"
                  id={field?.name}
                  error={errors[FORM_FILEDS.termsAcceptance]?.message}
                  {...field}
                />
              )}
            />
          </CheckDiv>
          <CheckDiv>
            <Controller
              name={FORM_FILEDS.contractAcceptance}
              defaultValue={false}
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I accept the Sosh Purchaser Creator Agreement."
                  id={field?.name}
                  error={errors[FORM_FILEDS.contractAcceptance]?.message}
                  {...field}
                />
              )}
            />
          </CheckDiv>
        </Div>
        {/* <br /> */}
        <CustomButton
          type="submit"
          disabled={
            errors[FORM_FILEDS.validAge] ||
            errors[FORM_FILEDS.username] ||
            isLoading
          }
          className="submit-button"
          loading={isLoading}
          color={"gradient"}
        >
          Create Account
        </CustomButton>
      </Form>
    </StyledRegisterModal>
  );
}

export default WalletForm;
WalletForm.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
};
