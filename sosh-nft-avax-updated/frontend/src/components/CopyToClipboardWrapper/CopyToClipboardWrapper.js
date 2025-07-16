import React, { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import { StlyedToolTipContent } from "./style";
import { Overlay } from "react-bootstrap";

import CopyIcon from "assets/icons/copyIcon";
import { copyToClipboard } from "common/common";
import { StyledToolTip } from "components/Tooltip/style";
import TickIcon from "assets/icons/tickIcon";

const CopyToClipboardWrapper = ({
  children,
  textToBeCopied,
  successIcon = <TickIcon className="icon" />,
  showCopyIcon = true,
  successMessage,
  className = "",
  popoverText,
  ...restProps
}) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState(popoverText);

  const showPopover = useCallback(() => {
    setShow(true);
  }, []);

  const hidePopover = useCallback(() => {
    setShow(false);
    if (popoverText) {
      setMessage(popoverText || "");
    }
  }, [popoverText]);

  const showSuccessPopover = useCallback(() => {
    setMessage(successMessage || "Copied");
    showPopover();
  }, [showPopover, successMessage]);

  const targetRef = useRef(null);
  const timerRef = useRef(null);

  const copyTextToClipboard = (e) => {
    e.stopPropagation();
    copyToClipboard({
      text: textToBeCopied,
      onSuccess: () => {
        showSuccessPopover();
        timerRef.current && clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => hidePopover(), 1500);
      },
    });
  };

  useEffect(() => {
    const curTime = timerRef.current;
    return () => {
      curTime && clearTimeout(curTime);
    };
  });

  const mouseEnterHandler = useCallback(() => {
    if (popoverText) {
      showPopover();
    }
  }, [popoverText, showPopover]);

  return (
    <>
      <div
        onClick={copyTextToClipboard}
        onKeyDown={() => {}}
        role="button"
        tabIndex={-1}
        ref={targetRef}
        onMouseEnter={mouseEnterHandler}
        className={`button copy-btn d-flex align-items-center ${className}`}
        onMouseLeave={hidePopover}
        {...restProps}
      >
        {children}
        {showCopyIcon && <CopyIcon className="icon copy-icon ml-3" />}
      </div>
      <Overlay
        target={targetRef.current}
        onHide={hidePopover}
        show={show}
        rootClose
      >
        {(overlayProps) => (
          <StyledToolTip {...overlayProps}>
            <StlyedToolTipContent>
              <span className="label">{message}</span> {successIcon}{" "}
            </StlyedToolTipContent>
          </StyledToolTip>
        )}
      </Overlay>
    </>
  );
};

CopyToClipboardWrapper.propTypes = {
  children: PropTypes.node,
  textToBeCopied: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showSuccess: PropTypes.bool,
  successMessage: PropTypes.string,
  showCopyIcon: PropTypes.bool,
  successIcon: PropTypes.node,
  className: PropTypes.string,
  popoverText: PropTypes.string,
};

export default CopyToClipboardWrapper;
