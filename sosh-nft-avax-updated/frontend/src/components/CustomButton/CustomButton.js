import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CustomButtonHoverEffects, StyledCustomButton } from "./style";

import { Spinner } from "react-bootstrap";
import { PalleteColorTypes } from "constants/appConstants";

const defaultClass = "button";

const CustomButton = (props) => {
  const {
    loading: _loading = false,
    children,
    loadingContent,
    state = "default",
    className: _className = "",
    appendElement,
    color = "primary",
    transparent,
    outline,
    hoverEffect,
    rounded = true,
    interactive = true,
    ...restProps
  } = props;
  const [loading, setLoading] = useState(_loading);
  const [className, setClassName] = useState(defaultClass);

  useEffect(() => {
    setLoading(_loading);
  }, [_loading]);

  useEffect(() => {
    let classText = [
      defaultClass,
      state,
      color,
      outline ? "outline" : "",
      ..._className.split(" "),
    ].join(" ");
    setClassName(classText);
  }, [_className, state, color, outline]);

  return (
    <StyledCustomButton
      type="button"
      className={className}
      color={color}
      $transparent={transparent}
      $outline={outline}
      $hoverStyle={hoverEffect}
      $rounded={rounded}
      $interactive={interactive}
      {...restProps}
    >
      <span>
        {loading && (
          <Spinner animation="border" role="status" className="spinner" />
        )}
        {loading && (loadingContent || loadingContent === null)
          ? loadingContent
          : children}
      </span>
      {appendElement ? appendElement : null}
    </StyledCustomButton>
  );
};

export default CustomButton;

CustomButton.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  loadingContent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  color: PropTypes.oneOf(PalleteColorTypes),
  state: PropTypes.oneOf(["error", "success", "default", "disabled"]),
  appendElement: PropTypes.node,
  className: PropTypes.string,
  $width: PropTypes.string,
  $fontSize: PropTypes.string,
  transparent: PropTypes.bool,
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  hoverEffect: PropTypes.oneOf(Object.values(CustomButtonHoverEffects)),
  rounded: PropTypes.bool,
  interactive: PropTypes.bool,
};
