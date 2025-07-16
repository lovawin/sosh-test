import React, { useCallback } from "react";
import PropTypes from "prop-types";

import CustomButton from "components/CustomButton";
import { StyledFollowListItem } from "./style";

import { apiHandler } from "services/axios";
import { followUser, unfollowUser } from "services/userServices";
import { toast } from "react-toastify";
import UserChip from "components/userChip/userChip";
import { openConfirmModal } from "store/commonStore/actionCreator";
import Avatar from "components/Avatar/Avatar";
import { useDispatch } from "react-redux";

function FollowListItem({
  showAction = false,
  isFollowed,
  onSuccess,
  ...userData
}) {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();

  const followToggle = useCallback(() => {
    setLoading(true);
    const userId = userData?._id;
    if (isFollowed) {
      apiHandler(() => unfollowUser(userId), {
        onSuccess: (result) => {
          onSuccess && onSuccess(userData, { followed: false });
        },
        onError: (error) => {
          toast("Unfollow failed", { type: "error", position: "top-right" });
        },
        final: () => {
          setLoading(false);
        },
      });
    } else {
      apiHandler(() => followUser(userId), {
        onSuccess: (result) => {
          onSuccess && onSuccess(userData, { followed: true });
        },
        onError: (error) => {
          toast("Follow failed", { type: "error", position: "top-right" });
        },
        final: () => {
          setLoading(false);
        },
      });
    }
  }, [isFollowed, onSuccess, userData]);

  const followToggleHandler = () => {
    if (isFollowed) {
      dispatch(
        openConfirmModal({
          onConfirm: followToggle,
          title: "",
          prepend: (
            <Avatar
              style={{
                margin: "auto",
              }}
              $imgURL={userData?.profile_image_url}
            />
          ),
          confirmLabel: "Unfollow",
          type: "delete",
          message: `Unfollow @${userData?.username}?`,
        })
      );
    } else {
      followToggle();
    }
  };

  return (
    <StyledFollowListItem className="follow-list-item">
      <UserChip {...userData} />
      {showAction && (
        <div className="action-wrap">
          <CustomButton
            color="gradient"
            onClick={followToggleHandler}
            loading={loading}
            outline={isFollowed}
            loadingContent={isFollowed ? "Unfollow" : "follow"}
            className="follow-button"
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </CustomButton>
        </div>
      )}
    </StyledFollowListItem>
  );
}

export default FollowListItem;

FollowListItem.propTypes = {
  _id: PropTypes.string.isRequired,
  profile_image_url: PropTypes.string,
  name: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  showAction: PropTypes.bool,
  isFollowed: PropTypes.bool,
  onSuccess: PropTypes.func,
};
