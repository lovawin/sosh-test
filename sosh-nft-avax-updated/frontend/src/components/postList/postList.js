import React from "react";
import PropTypes from "prop-types";
import { StyledPostListWrapper, StyledPostList } from "./style";
import PostCard from "components/myProfileComponents/postCards/postCard";
import { range } from "lodash";
import PostCardSkeleton from "components/myProfileComponents/postCards/postCardSkeleton";
import { useNavigate } from "react-router";
import Routes from "constants/routes";
import EmptyData from "../emptyData/emptyData";

const loadingPosts = range(6);

function PostList({ data = [], isLoggedInProfile, loading, onPostDelete }) {
  const navigate = useNavigate();
  console.log('data from post list', data) 

  return (
    <StyledPostListWrapper>
      <StyledPostList>
        {loading
          ? loadingPosts.map((_, i) => {
              return <PostCardSkeleton />;
            })
          : data.length > 0 &&
            data?.map((value, i) => {
              return (
                <PostCard
                  isLoggedInProfile={isLoggedInProfile}
                  key={`${value?.id}-${i}`}
                  data={value}
                  onDelete={onPostDelete}
                  
                />
              );
            })}
      </StyledPostList>
      {!loading && !data?.length && (
        <EmptyData
          message={
            isLoggedInProfile
              ? "You haven't Posted any NFT yet."
              : "This user hasn't Posted any NFT yet."
          }
          actionLabel="Create Post"
          action={() => navigate(Routes.createNFT)}
        />
      )}
    </StyledPostListWrapper>
  );
}

export default PostList;

PostList.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  onPostDelete: PropTypes.func,
};
