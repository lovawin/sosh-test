import React, { useState } from "react";
import PropTypes from "prop-types";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { StyledWrapper } from "./style";
import "react-lazy-load-image-component/src/effects/blur.css";
import PlaceholderIcon from "assets/icons/placeholderIcon";
import { useTheme } from "styled-components";

const ImageComponent = ({
  src,
  className,
  alt = "",
  aspectRatio = 1.36,
  freeSize = false,
  wrapperClassName = "",
  imageComponentProps = {},
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const toggleLoading = () => setLoading((prev) => !prev);

  const memoizedImageComponent = React.useMemo(
    () => (
      <LazyLoadImage
        src={src}
        wrapperClassName={"image-wrapper"}
        placeholder={<span className={"place-holder"}></span>}
        {...imageComponentProps}
        effect={"blur"}
        alt={alt}
        className={`lazy-image${className ? ` ${className}` : ""}`}
        beforeLoad={toggleLoading}
        afterLoad={toggleLoading}
      />
    ),
    [src, alt, className, imageComponentProps]
  );

  return (
    <StyledWrapper
      aspectRatio={aspectRatio}
      freeSize={freeSize}
      className={wrapperClassName}
      $loading={loading}
      {...props}
    >
      {src && memoizedImageComponent}
      {(!src || loading) && (
        <div className="image-wrapper placeholder-image">
          <PlaceholderIcon backgroundColor={theme.palette.common.gray} />
        </div>
      )}
    </StyledWrapper>
  );
};

ImageComponent.propTypes = {
  src: PropTypes.string,
  className: PropTypes.string,
  alt: PropTypes.string,
  aspectRatio: PropTypes.number,
  freeSize: PropTypes.bool,
  wrapperClassName: PropTypes.string,
  imageComponentProps: PropTypes.object,
};

export default React.memo(ImageComponent);
