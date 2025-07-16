import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { StyledTagsWrapper } from "./style";

const tags = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "youtube",
    label: "Youtube",
    image: "/img/youtube.svg",
  },
  {
    value: "instagram",
    label: "Instagram",
    image: "/img/instagram.svg",
  },
  {
    value: "twitter",
    label: "X (Twitter)",
    image: "/img/twitter.svg",
  },
  {
    value: "tiktok",
    label: "TikTok",
    image: "/img/tiktok.svg",
  },
];

const defaultTag = {
  value: "all",
  label: "All",
};
function PlatformFilter({ onSelect, selected }) {
  const [selectedTag, setSelectedTag] = useState(defaultTag);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);

    onSelect && onSelect(tag?.value === "all" ? null : tag);
  };

  useEffect(() => {
    if (selected) {
      const tempTag = tags.find((tag) => tag.value === selected);
      if (tempTag && tempTag?.value !== selectedTag?.value) {
        setSelectedTag(tempTag);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <StyledTagsWrapper className="platform-tags-wrapper">
      <h3 className="platform-tags-section-title">Tags</h3>
      <div className="platform-tag-list">
        {tags.map((tag) => {
          return (
            <div
              key={tag?.value}
              className={`platform-tag${
                selectedTag?.value === tag?.value ? " selected" : ""
              }`}
              role="button"
              onKeyPress={() => handleTagClick(tag)}
              onClick={() => handleTagClick(tag)}
            >
              {tag?.image && (
                <img
                  className="platform-tag-image"
                  src={tag?.image}
                  alt={tag?.label}
                />
              )}
              <span
                className={`platform-tag-label${
                  !tag?.image ? " less-spaced" : ""
                }`}
              >
                {tag?.label}
              </span>
            </div>
          );
        })}
      </div>
    </StyledTagsWrapper>
  );
}

export default PlatformFilter;
PlatformFilter.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.string,
};
