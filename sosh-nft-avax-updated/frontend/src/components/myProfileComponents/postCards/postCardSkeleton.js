import React from "react";
import PropTypes from "prop-types";

import { StyledPostCard } from "./style";

import ImageSkeleton from "components/skeletons/imageSkeleton";
import BoxSkeleton from "components/skeletons/boxSkeleton";
import TextSkeleton from "components/skeletons/textSkeleton";

function PostCardSkeleton({ data, linkable = true, isLoggedInProfile }) {
  return (
    <StyledPostCard $interactive={false}>
      <div className="post-image-wrapper">
        <ImageSkeleton aspectRatio={1.18} />

        <BoxSkeleton radius={"50%"} className="social-image" />
      </div>
      <div className="details-container">
        <div className="info-wrapper">
          <TextSkeleton type="title" />
          <br />
          <TextSkeleton lines={2} />
        </div>
      </div>
      <div className="actions-container">
        <hr style={{ color: "gray" }} />

        <TextSkeleton />
        <br />
        <span style={{ marginLeft: "10px" }}>
          <TextSkeleton />
        </span>

        {isLoggedInProfile && <TextSkeleton />}
      </div>
    </StyledPostCard>
  );
}

export default PostCardSkeleton;

PostCardSkeleton.propTypes = {
  data: PropTypes.object,
  linkable: PropTypes.bool,
};
