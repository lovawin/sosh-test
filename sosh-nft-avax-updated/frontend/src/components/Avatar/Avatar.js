import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Spinner } from "react-bootstrap";
import { AvatarWrapper } from "./style";
import { COMPONENT_SIZES } from "constants/appConstants";

import User2Icon from "assets/icons/user2Icon";
import { convertPxToRem } from "common/helpers";

function Avatar(props) {
  const {
    loading: _loading = false,
    $size = COMPONENT_SIZES.MEDIUM,
    className: _className = "",
    disableNativeLoading = false,
    ...restProps
  } = props;
  const [loading, setLoading] = useState(_loading);
  const [className, setClassName] = useState("");

  const canLoadInternal = useMemo(() => {
    return !_loading && !disableNativeLoading;
  }, [_loading, disableNativeLoading]);

  useEffect(() => {
    let classText = [
      `avatar-wrap avatar-${$size}-wrapper`,
      ..._className.split(" "),
    ].join(" ");
    setClassName(classText);
  }, [_className, $size]);

  useEffect(() => {
    setLoading(_loading);
  }, [_loading]);

  const startLoading = useCallback(() => {
    if (canLoadInternal) {
      setLoading(true);
    }
  }, [canLoadInternal]);

  const stopLoading = useCallback(() => {
    if (canLoadInternal) {
      setLoading(false);
    }
  }, [canLoadInternal]);

  return (
    <AvatarWrapper {...restProps} className={className}>
      <div className="image-wrap">
        {props.$imgURL ? (
          <img
            src={props.$imgURL}
            alt="user"
            style={{ height: "inherit" }}
            onLoadStart={startLoading}
            onLoad={stopLoading}
            onLoadedData={stopLoading}
          />
        ) : (
          <User2Icon className={`default-avatar ${$size ? ` $size` : ""}`} />
        )}
        {loading && (
          <div className="loader-wrap">
            <Spinner
              style={{
                width: convertPxToRem(30),
                height: convertPxToRem(30),
                borderWidth: "2px",
              }}
              variant="dark"
              animation="border"
            >
              {""}
            </Spinner>
          </div>
        )}
      </div>
    </AvatarWrapper>
  );
}

export default Avatar;

Avatar.propTypes = {
  $imgURL: PropTypes.string,
  $width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  $height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  $square: PropTypes.bool,
  $size: PropTypes.oneOf(Object.values(COMPONENT_SIZES)),
  loading: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  disableNativeLoading: PropTypes.bool,
};
