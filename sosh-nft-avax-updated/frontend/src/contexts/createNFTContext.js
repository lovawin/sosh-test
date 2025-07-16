import React, { createContext, useCallback, useState } from "react";
import PropTypes from "prop-types";

const FORM_INITIAL_DATA = {
  title: "",
  link: "",
  category: "",
  hashtag: "",
  caption: "",
};

const defaultState = {
  formData: FORM_INITIAL_DATA,
  setFieldValue: () => {},
  resetForm: () => {},
};

export const CreateNFTContext = createContext(defaultState);

const CreateNFTContextProvider = ({ children }) => {
  const [formData, setFormData] = useState(defaultState.formData);

  const setFieldValue = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(FORM_INITIAL_DATA);
  }, []);

  return (
    <CreateNFTContext.Provider
      value={{
        formData,
        setFieldValue,
        resetForm,
      }}
    >
      {children}
    </CreateNFTContext.Provider>
  );
};
CreateNFTContextProvider.propTypes = {
  children: PropTypes.node,
};

export default CreateNFTContextProvider;
