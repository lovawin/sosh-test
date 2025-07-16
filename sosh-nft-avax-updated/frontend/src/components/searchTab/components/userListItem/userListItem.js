import React from "react";
import PropTypes from "prop-types";
import Avatar from "components/Avatar/Avatar";
import { convertPxToRem } from "common/helpers";
import { HeadDiv, UserDiv, UserSpan, ProfileDesc, UserName } from "../../style";
import { StyledUserListItem } from "./style";
import { getCountBasedText } from "common/helpers/textHelpers";

function UserListItem({
  profile_image_url,
  name,
  tiktokUsername,
  twitterUsername,
  youtubeUsername,
  instagramUsername,
  followers,
  following,
}) {
  return (
    <StyledUserListItem>
      <HeadDiv>
        <Avatar
          $width={convertPxToRem(50)}
          $height={convertPxToRem(50)}
          $imgURL={profile_image_url}
        />

        <UserDiv>
          <UserSpan>
            <UserName>{name}</UserName>
          </UserSpan>
          <ProfileDesc>
            {" "}
            <span className="follow">
              {" "}
              {getCountBasedText(followers?.length, "Follower")}{" "}
              {followers?.length}
            </span>
            <span className="follow"> Following {following?.length}</span>
          </ProfileDesc>
        </UserDiv>
      </HeadDiv>{" "}
      <div className="social-icon-wrap">
        {instagramUsername ? (
          <img
            alt="instagram"
            className="social-image"
            src="img/instagram.svg"
          />
        ) : (
          ""
        )}
        {tiktokUsername ? (
          <img alt="tiktok" className="social-image" src="img/tiktok.svg" />
        ) : (
          ""
        )}
        {youtubeUsername ? (
          <img alt="instagram" className="social-image" src="img/youtube.svg" />
        ) : (
          ""
        )}
        {twitterUsername ? (
          <img alt="instagram" className="social-image" src="img/twitter.svg" />
        ) : (
          ""
        )}
      </div>
    </StyledUserListItem>
  );
}

export default UserListItem;

UserListItem.propTypes = {
  profile_image_url: PropTypes.string,
  name: PropTypes.string,
  tiktokUsername: PropTypes.string,
  twitterUsername: PropTypes.string,
  youtubeUsername: PropTypes.string,
  instaUsername: PropTypes.string,
  followers: PropTypes.array,
  following: PropTypes.array,
};
