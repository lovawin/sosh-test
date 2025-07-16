import React, { useMemo } from "react";

import PropTypes from "prop-types";
import { StyledLikeButton } from "./style";
import MiniLoader from "components/miniLoader";
import LikeIcon from "assets/icons/likeIcon";
import { useTheme } from "styled-components";
import UnlikeIcon from "assets/icons/unlikeIcon";
import { getCountBasedText } from "common/helpers/textHelpers";

function LikeButton({
  isLiked,
  onClick,
  loading,
  count,
  noLabel = false,
  disabled,
}) {
  const theme = useTheme();

  const Icon = useMemo(() => {
    if (loading) {
      return <MiniLoader className="icon" />;
    } else if (isLiked) {
      return <UnlikeIcon fillColor={"#f00"} className="icon" />;
    }
    return <LikeIcon fillColor={theme.palette.text.gray} className="icon" />;
  }, [loading, isLiked, theme]);

  return (
    <StyledLikeButton
      className="button like-button"
      $noLabel={noLabel}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon}
      {noLabel ? null : (
        <span className="label">
          {getCountBasedText(count, "Like", Boolean(count))}
        </span>
      )}
    </StyledLikeButton>
  );
}

export default LikeButton;

LikeButton.propTypes = {
  isLiked: PropTypes.bool,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  count: PropTypes.number,
  noLabel: PropTypes.bool,
  disabled: PropTypes.bool,
};
