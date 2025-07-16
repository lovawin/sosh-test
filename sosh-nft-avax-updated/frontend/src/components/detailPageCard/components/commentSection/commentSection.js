import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiHandler } from "services/axios";
import { addCommentOnAsset, getAssetDetails } from "services/assetsServices";
import EmojiPickerComponent from "../EmojiPickerComponent";
import {
  CommentForm,
  Input,
  InputLable,
  StyledCommentSectionWrap,
} from "./style";
import CustomButton from "components/CustomButton";
import AirplaneIcon from "assets/icons/airplaneIcon";
import InfiniteScrollComponent from "components/infiniteScrollComponent";
import CommentItem from "../commentItem/commentItem";
import usePagination from "hooks/usePagination";
import MiniLoader from "components/miniLoader";

function CommentSection({ assetId, initialComments = [], totalComments = 0 }) {
  const [comments, setComments] = useState(initialComments);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const isLogin = useSelector((state) => state.login.isLogin);
  const { userData } = useSelector((state) => state.user);
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const { page, limit, total, setTotal, setPage } = usePagination({
    page: 2,
    total: totalComments,
  });
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setHasMore(comments?.length < total);
  }, [total, comments]);

  const fetchComments = useCallback(
    ({ page: _page = 1, limit: _limit = limit } = {}) => {
      setCommentsLoading(true);

      apiHandler(
        () =>
          getAssetDetails(assetId, {
            page: _page,
            limit: _limit,
          }),
        {
          onSuccess: (data) => {
            const {
              comments: {
                pagination: { total: _total },
                result,
              },
            } = data ?? {};
            setTotal(_total);
            setPage(_page);
            if (_page === 1) {
              setComments(result);
            } else {
              setComments((prev) => [...prev, ...result]);
            }
          },
          final: () => {
            setCommentsLoading(false);
          },
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, assetId]
  );

  useEffect(() => {
    if (chosenEmoji?.emoji) {
      setComment((prev) => prev + chosenEmoji?.emoji);
    }
  }, [chosenEmoji]);

  const startCommenting = useCallback(() => {
    setIsCommenting(true);
  }, []);

  const stopCommenting = useCallback(() => {
    setIsCommenting(false);
  }, []);

  const handleComment = (e) => {
    e.preventDefault();
    if (!isLogin) {
      toast("Please Connect Wallet", {
        type: "info",
      });
      return true;
    }
    if (!comment) {
      toast("Please enter comment", {
        type: "info",
      });
      return true;
    } else {
      startCommenting();
      apiHandler(() => addCommentOnAsset(assetId, comment), {
        onSuccess: (data) => {
          const {
            comments: {
              pagination: { total: _total },
              result,
            },
          } = data?.details ?? {};
          setTotal(_total);
          setPage(1);
          setComments(result || []);

          setComment("");
        },
        onError: (error) => {
          toast("Failed to add comment", {
            type: "error",
          });
        },
        final: () => {
          stopCommenting();
        },
      });
    }
  };

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
  };

  const commentDeleteHandler = useCallback((id) => {
    setComments((prev) => prev.filter((comment) => comment._id !== id));
  }, []);

  const commentLikeToggleHandler = useCallback(
    (id) => {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === id) {
            comment.liked = !comment.liked;
            comment.likedBy = comment?.liked
              ? [...comment.likedBy, userData]
              : comment.likedBy.filter(({ _id }) => _id !== userData?._id);
          }
          return comment;
        })
      );
    },
    [userData]
  );

  const getNextComments = useCallback(() => {
    fetchComments({ page: page + 1 });
  }, [fetchComments, page]);

  return (
    <StyledCommentSectionWrap>
      <CommentForm onSubmit={handleComment}>
        <InputLable>
          <EmojiPickerComponent
            onEmojiClick={onEmojiClick}
            containerProps={{ className: "emoji-icon-wrap" }}
          />

          <Input
            type="search"
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment"
            value={comment}
          />
        </InputLable>{" "}
        <CustomButton
          loading={isCommenting}
          disabled={isCommenting || !comment}
          loadingContent={null}
          color="gradient"
          className="comment-button"
          type="submit"
        >
          <AirplaneIcon />
        </CustomButton>
      </CommentForm>
      <div className="comment-list" id="comment-list">
        <InfiniteScrollComponent
          loading={commentsLoading}
          hasMore={hasMore}
          next={getNextComments}
          scrollableTarget="comment-list"
          dataLength={comments?.length}
        >
          {comments?.map((value, i) => {
            return (
              <CommentItem
                key={`${value?._id}-${i}`}
                {...value}
                onLikeToggle={commentLikeToggleHandler}
                onCommentDelete={commentDeleteHandler}
              />
            );
          })}
        </InfiniteScrollComponent>
        {commentsLoading && (
          <MiniLoader
            className="spinner"
            containerClassName="comments-loader"
            label="Loading Comments..."
          />
        )}
      </div>
    </StyledCommentSectionWrap>
  );
}

export default CommentSection;
CommentSection.propTypes = {
  assetId: PropTypes.string,
  initialComments: PropTypes.array,
  totalComments: PropTypes.number,
};
