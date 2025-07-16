import React, { useCallback } from "react";

import { FormControl } from "react-bootstrap";

import PropTypes from "prop-types";

import { InputStyled, InputWrap, LabelStyled, StyledCheckmark } from "./style";
import CheckIcon from "assets/icons/checkIcon";
import { useTheme } from "styled-components";

export const CheckMark = ({ target, value, disabled = false, ...rest }) => {
  const theme = useTheme();
  return (
    <StyledCheckmark
      htmlFor={target}
      tabIndex={0}
      className={`checkmark ${value ? "checked" : ""} ${
        disabled ? "disabled" : ""
      }`}
      {...rest}
    >
      <CheckIcon fillColor={value ? "#fff" : theme.palette.text.gray} />
    </StyledCheckmark>
  );
};

CheckMark.propTypes = {
  target: PropTypes.string.isRequired,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
};

const Checkbox = ({
  label,
  value,
  error,
  labelProps = {},
  color,
  width,
  onChange,
  ...props
}) => {
  const changeHandler = useCallback(
    (e) => {
      const value = e.target.checked;
      onChange && onChange(value, e);
    },
    [onChange]
  );

  const keyDownHandler = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.target.click();
    }
  }, []);

  return (
    <>
      <InputWrap>
        <InputStyled
          checked={value}
          {...props}
          type="checkbox"
          isInvalid={error}
          $isInvalid={error}
          onChange={changeHandler}
        />

        <div className="checkmark-wrap">
          <CheckMark
            target={props.id || props.name}
            value={value}
            color={color}
            width={width}
            onKeyDown={keyDownHandler}
            className={`checkmark${value ? " checked" : ""}`}
          />

          {label && (
            <LabelStyled
              className="label checkbox-label"
              htmlFor={props.id || props.name}
              {...labelProps}
            >
              {label}
            </LabelStyled>
          )}
        </div>

        <FormControl.Feedback type={"invalid"}>{error}</FormControl.Feedback>
      </InputWrap>
    </>
  );
};

Checkbox.propTypes = {
  ...FormControl.propTypes,
  label: PropTypes.string,
  labelProps: PropTypes.object,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  width: PropTypes.string,
  value: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
};

export default Checkbox;
