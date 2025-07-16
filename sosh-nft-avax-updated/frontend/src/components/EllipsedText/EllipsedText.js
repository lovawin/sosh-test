import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { StyledEllipsedText } from "./style";

const EllipsePositions = {
  start: "start",
  end: "end",
  middle: "middle",
};

const getEllipsedText = ({ text, maxLength, ellipseText, ellipsePosition }) => {
  if (text.length > maxLength) {
    switch (ellipsePosition) {
      case EllipsePositions.start:
        return `${ellipseText}${text.slice(text?.length - maxLength)}`;
      case EllipsePositions.end:
        return `${text.slice(0, maxLength)}${ellipseText}`;
      case EllipsePositions.middle:
        return `${text.slice(0, maxLength / 2)}${ellipseText}${text.slice(
          text?.length - maxLength / 2
        )}`;
      default:
        return text;
    }
  }
  return text;
};

function EllipsedText({
  text: textProp,
  maxLength = 10,
  ellipsePosition = EllipsePositions.end,
  ellipseText = "...",
  showMoreButton = false,
}) {
  const [text, setText] = React.useState("");
  const [showFull, setShowFull] = React.useState(false);

  const toggleShowFull = () => {
    setShowFull((prev) => !prev);
  };

  useEffect(() => {
    if (textProp?.length > maxLength && !showFull) {
      const TempEllipsedText = getEllipsedText({
        text: textProp,
        maxLength,
        ellipseText,
        ellipsePosition,
      });

      setText(TempEllipsedText);
    } else {
      setText(textProp);
    }
  }, [textProp, maxLength, ellipsePosition, ellipseText, showFull]);

  return (
    <StyledEllipsedText className="ellipsed-text">
      {text}
      {textProp?.length > maxLength && showMoreButton ? (
        <span
          className="show-more-button link-primary"
          onClick={toggleShowFull}
        >
          show {showFull ? "less" : "more"}
        </span>
      ) : null}
    </StyledEllipsedText>
  );
}

export default EllipsedText;

EllipsedText.propTypes = {
  text: PropTypes.string,
  maxLength: PropTypes.number,
  ellipsePosition: PropTypes.oneOf(Object.values(EllipsePositions)),
  ellipseText: PropTypes.string,
  showMoreButton: PropTypes.bool,
};
