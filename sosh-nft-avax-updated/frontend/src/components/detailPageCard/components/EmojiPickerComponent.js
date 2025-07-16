import React, { useRef } from "react";
import PropTypes from "prop-types";
import EmojiPicker from "emoji-picker-react";
import SmileIcon from "assets/icons/smileIcon";
import { OverlayTrigger, Popover } from "react-bootstrap";

const EmojiPickerComponent = ({
  onEmojiClick,
  containerProps: { className: containerClassName } = {},
}) => {
  const target = useRef(null);

  const renderPicker = ({ style, ...restProps }) => {
    return (
      <Popover {...restProps} style={{ ...style }}>
        <EmojiPicker onEmojiClick={onEmojiClick} />
      </Popover>
    );
  };

  return (
    <OverlayTrigger trigger={["click"]} overlay={renderPicker} target={target}>
      <span
        ref={target}
        className={containerClassName}
        style={{ cursor: "pointer" }}
      >
        <SmileIcon className="emoji-icon" />
      </span>
    </OverlayTrigger>
  );
};

EmojiPickerComponent.propTypes = {
  ...EmojiPicker.propTypes,
  containerProps: PropTypes.object,
};

export default EmojiPickerComponent;
