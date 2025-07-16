import React from "react";
import PropTypes from "prop-types";

import MiniLoaderIcon from "../../assets/icons/miniLoaderIcon";
import { StyledLoader } from "./style";

const MiniLoader = (props) => {
  const {
    fill = "currentColor",
    vertical = false,
    width,
    label = null,
    speed = "normal",
    containerClassName = "",
    ...rest
  } = props;

  return (
    <StyledLoader
      vertical={vertical}
      width={width}
      speed={speed}
      className={containerClassName}
    >
      <MiniLoaderIcon fillColor={fill} {...rest} />
      {label && <span className="text">{label}</span>}
    </StyledLoader>
  );
};

export default MiniLoader;

MiniLoader.propTypes = {
  width: PropTypes.string,
  fill: PropTypes.string,
  label: PropTypes.string,
  vertical: PropTypes.bool,
  speed: PropTypes.oneOf(["slow", "normal", "fast"]),
  containerClassName: PropTypes.string,
};
