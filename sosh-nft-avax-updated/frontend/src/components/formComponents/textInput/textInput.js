import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { StyledTextInput } from "./style";
import { FormControl, FormLabel } from "react-bootstrap";
import FormErrorMsg from "../FormErrorMsg/FormErrorMsg";

const TextInput = forwardRef(
  (
    {
      label,
      id,
      name,
      helperText,
      outline,
      as,
      error,
      containerClass,
      ...restProps
    },
    forwardedRef
  ) => {
    return (
      <>
        <StyledTextInput
          $isTextarea={as === "textarea"}
          className="text-input-wrap"
          $outline={outline}
        >
          <div
            className={`input-wrap${
              containerClass ? ` ${containerClass}` : ""
            }`}
          >
            {label && (
              <FormLabel htmlFor={id ?? name} className="text-input-label">
                {label}
              </FormLabel>
            )}
            <FormControl
              id={id ?? name}
              name={name}
              isInvalid={error}
              bsPrefix="custom-text-input"
              ref={forwardedRef}
              as={as}
              {...restProps}
            />
          </div>

          {!error && helperText && (
            <span className="text-helper">{helperText}</span>
          )}

          <FormErrorMsg outSideContainer className="invalid-feedback">
            {error}
          </FormErrorMsg>
        </StyledTextInput>
      </>
    );
  }
);

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  containerClass: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  ...FormControl.propTypes,
};

export default TextInput;
