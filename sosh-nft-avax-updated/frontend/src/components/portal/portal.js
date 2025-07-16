import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

function Portal({ children, target, fallbackOnBody = false }) {
  const [canRenderInPortal, setCanRenderInPortal] = useState(false);
  const portalRef = useRef(null);

  useEffect(() => {
    if (typeof target === "string") {
      portalRef.current = document.getElementById(target);
      setCanRenderInPortal(Boolean(portalRef.current));
    } else if (
      typeof target === "object" &&
      target?.current instanceof Element
    ) {
      portalRef.current = target.current;
      setCanRenderInPortal(true);
    } else if (fallbackOnBody) {
      portalRef.current = document.body;
      setCanRenderInPortal(true);
    } else {
      setCanRenderInPortal(false);
    }
  }, [target, fallbackOnBody]);

  if (!canRenderInPortal) {
    return null;
  } else {
    return ReactDOM.createPortal(children, portalRef.current);
  }
}

export default Portal;

Portal.propTypes = {
  children: PropTypes.node,
  target: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  fallbackOnBody: PropTypes.bool,
};
