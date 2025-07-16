import React from "react";
import PropTypes from "prop-types";
import { StyledHashtag } from "./style";
import { getCountBasedText } from "common/helpers/textHelpers";

function HashTag({ tag: { name, id, postCount } = {}, onClick }) {
  return (
    <StyledHashtag className="hash-tag-wrap">
      <span className="hash-sign">#</span>
      <div>
        <p className="hash-tag">{name}</p>
        {postCount && (
          <span className="post-count">
            {getCountBasedText(postCount, "Post", true)}
          </span>
        )}
      </div>
    </StyledHashtag>
  );
}

export default HashTag;

HashTag.propTypes = {
  tag: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number,
  }),
};
