import React from "react";
import PropTypes from "prop-types";
import { convertPxToRem } from "common/helpers";
import Avatar from "components/Avatar/Avatar";
import { StyledUserChip } from "./style";
import { useSelector } from "react-redux";

function UserChip({ name, username, profile_image_url, _id }) {
  const { userData } = useSelector((state) => state.user);

  return (
    <StyledUserChip
      className="detail-wrap user-profile-link"
      to={`/user-profile/${_id}`}
      $disabled={userData?._id === _id}
    >
      <Avatar
        $width={convertPxToRem(45)}
        $height={convertPxToRem(45)}
        $imgURL={profile_image_url}
      />
      <div className="details">
        <p className="name">{name}</p>
        <p className="username">{username}</p>
      </div>
    </StyledUserChip>
  );
}

export default UserChip;
UserChip.propTypes = {
  name: PropTypes.string,
  username: PropTypes.string,
  profile_image_url: PropTypes.string,
  _id: PropTypes.string,
};
