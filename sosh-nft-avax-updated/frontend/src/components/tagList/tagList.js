import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { StyledTagsWrapper } from "./style";
import CloseIcon from "assets/icons/closeIcon";

function TagList({ onSelect, selected, tags, onCancel, cancelable = true }) {
  const [selectedTag, setSelectedTag] = useState(null);

  const handleTagClick = (tag) => {
    if (onSelect) {
      setSelectedTag(tag);
      onSelect(tag);
    }
  };

  useEffect(() => {
    if (selected !== selectedTag) {
      setSelectedTag(selected);
    }
  }, [selected, selectedTag]);

  const handleTagClose = (e, tag) => {
    e.stopPropagation();
    onCancel && onCancel(tag);
  };

  if (tags?.length) {
    return (
      <StyledTagsWrapper
        className="tags-wrapper"
        $cancelable={cancelable}
        $selectible={Boolean(onSelect)}
      >
        <div className="tag-list">
          {tags.map((tag) => {
            return (
              <div
                key={tag?.value}
                className={`tag${selectedTag === tag ? " selected" : ""}`}
                role="button"
                onKeyPress={() => handleTagClick(tag)}
                onClick={() => handleTagClick(tag)}
              >
                <span className={`tag-label`}>{tag}</span>
                {cancelable && (
                  <span
                    className="close-icon-wrap"
                    role="button"
                    onClick={(e) => handleTagClose(e, tag)}
                  >
                    <CloseIcon />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </StyledTagsWrapper>
    );
  } else {
    return null;
  }
}

export default TagList;
TagList.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.string,
  onCancel: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string),
  cancelable: PropTypes.bool,
};
