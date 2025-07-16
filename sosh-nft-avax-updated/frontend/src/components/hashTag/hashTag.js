import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyledHashTag } from "./style";
import Routes from "constants/routes";

function HashTag({ tag, bold = false, redirectRoute = Routes.home }) {
  const [tagName, setTagName] = useState(tag);

  useEffect(() => {
    if (tag && tag[0] === "#") {
      setTagName(tag.slice(1));
    }
  }, [tag]);

  if (tag) {
    return (
      <StyledHashTag
        className="hash-tag"
        $bold={bold}
        to={`${redirectRoute}?tags=${tagName}`}
      >
        {tag}
      </StyledHashTag>
    );
  } else {
    return null;
  }
}

export default HashTag;
HashTag.propTypes = {
  tag: PropTypes.string,
  bold: PropTypes.bool,
  redirectRoute: PropTypes.string,
};
