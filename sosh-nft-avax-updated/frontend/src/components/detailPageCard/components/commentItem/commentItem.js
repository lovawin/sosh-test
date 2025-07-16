import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";

import { useSelector, useDispatch } from "react-redux";
import LikeButton from "components/likeButton";
import DeleteButton from "components/deleteButton";
import { apiHandler } from "services/axios";

import { openConfirmModal } from "store/commonStore/actionCreator";
import { StyledCommentItem } from "./style";
import { deleteComment, likeComment } from "services/assetsServices";
import { toast } from "react-toastify";
import { getCountBasedText } from "common/helpers/textHelpers";
import UserChip from "components/userChip/userChip";

function CommentItem({
  text: comment,
  creator,
  createdBefore,
  _id: id,
  delete: canDelete,
  liked,
  likedBy,
  onCommentDelete,
  onLikeToggle,
}) {
  const { isLogin } = useSelector((state) => state.login);
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleDelete = useCallback(() => {
    if (isLogin) {
      setIsDeleting(true);
      apiHandler(() => deleteComment(id), {
        onSuccess: () => {
          onCommentDelete && onCommentDelete(id);
          toast("Comment deleted successfully.", {
            position: "top-right",
            type: "success",
          });
        },
        onError: () => {
          toast("Error while deleting comment", {
            position: "top-right",
            type: "error",
          });
        },
        final: () => {
          setIsDeleting(false);
        },
      });
    }
  }, [id, onCommentDelete, isLogin]);

  const confirmDelete = useCallback(() => {
    setIsDeleting(true);
    dispatch(
      openConfirmModal({
        message: "Are you sure you want to delete this comment?",
        confirmLabel: "Delete",
        type: "delete",
        onConfirm: () => handleDelete(),
        onCancel: () => {
          setIsDeleting(false);
        },
      })
    );
  }, [handleDelete, dispatch]);

  const likeAndDislikeComment = useCallback(() => {
    if (isLogin) {
      setIsLiking(true);
      apiHandler(() => likeComment(id, !liked), {
        onSuccess: () => {
          onLikeToggle && onLikeToggle(id);
        },
        onError: () => {
          toast("Error while liking comment", {
            position: "top-right",
            type: "error",
          });
        },
        final: () => {
          setIsLiking(false);
        },
      });
    }
  }, [id, liked, onLikeToggle, isLogin]);

  return (
    <StyledCommentItem>
      <div className="extra-details">
        <UserChip {...creator} />
        <div className="comment-action-details">
          {" "}
          <div className="comment-actions-wrapper">
            {isLogin ? (
              <LikeButton
                loading={isLiking}
                disabled={isLiking}
                noLabel
                isLiked={liked}
                onClick={likeAndDislikeComment}
              />
            ) : null}
            {isLogin && canDelete ? (
              <DeleteButton
                loading={isDeleting}
                noLabel
                onClick={confirmDelete}
              />
            ) : null}
            <br />
          </div>
          <div className="like-details">
            <span
              style={{
                marginRight: "5px",
                fontSize: "14px",
                color: "gray",
              }}
            >
              {getCountBasedText(createdBefore, "Day", true)} ago
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "gray",
              }}
            >
              {getCountBasedText(likedBy?.length, "Like", true)}
            </span>
          </div>
        </div>
      </div>

      <p className="comment">{comment}</p>
    </StyledCommentItem>
  );
}

export default CommentItem;

CommentItem.propTypes = {
  text: PropTypes.string,
  creator: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    profile_image_url: PropTypes.string,
  }),
  createdBefore: PropTypes.string,
  likedBy: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      username: PropTypes.string,
      profile_image_url: PropTypes.string,
    })
  ),
  _id: PropTypes.string,
  delete: PropTypes.bool,
  liked: PropTypes.bool,
  onLikeToggle: PropTypes.func,
  onCommentDelete: PropTypes.func,
};
