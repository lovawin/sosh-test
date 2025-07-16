import InstagramIcon from "assets/icons/instagramIcon";
import TwitterIcon from "assets/icons/twitterIcon";
import useMediaQuery from "hooks/useMediaQuery";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EllipsedText from "components/EllipsedText";
import { deviceQuery } from "styles/mediaSizes";
import { Main, Para, TopDiv, FollowersWrap } from "./style";
import { useParams } from "react-router";
import { apiHandler } from "services/axios";

import FollowListItem from "../followListItem/followListItem";
import { followUser, unfollowUser } from "services/userServices";
import { setUserData } from "store/userStore/actionCreators";
import CustomButton from "components/CustomButton";
import { toast } from "react-toastify";
import YoutubeIcon from "assets/icons/youtubIcon";
import { getSuggestAccount } from "services/assetsServices";
import {
  getInstagramProfileLink,
  getTiktokProfileLink,
  getTwitterProfileLink,
  getYoutubeChannelLink,
} from "common/helpers/socialMediaHelpers";
import Avatar from "components/Avatar/Avatar";
import { convertPxToRem } from "common/helpers";
import { getCountBasedText } from "common/helpers/textHelpers";
import ArrowLeft from "assets/icons/arrowLeft";
import {
  openConfirmModal,
  openShareModal,
} from "store/commonStore/actionCreator";
import TiktokIcon from "assets/icons/tiktokIcon";
import ShareIcon from "assets/icons/shareIcon";

function ProfileDetailsCard(props) {
  const [profileData, setProfileData] = useState({
    profile_image_url: "user.png",
  });

  const { isLoggedInProfile } = props;

  const [suggestAcc, setSuggestAcc] = useState([]);
  const [followerShow, setFollowerShow] = useState(false);
  const [isFollowInProgress, setFollowProgress] = useState(false);
  const dispatch = useDispatch();
  const isLargeTablet = useMediaQuery(deviceQuery.tabletL);
  const isMobile = useMediaQuery(deviceQuery.mobile);
  const [name, setName] = useState("");

  const Params = useParams();
  const userData = useSelector((state) => state?.user?.userData);

  const updateAndDispatchUserFollowList = useCallback(
    (data, isFollowed) => {
      let newFollowing = [...userData?.following];
      if (isFollowed) {
        newFollowing = [...newFollowing, data];
      } else {
        newFollowing = newFollowing.filter((item) => item?._id !== data?._id);
      }

      dispatch(setUserData({ ...userData, following: newFollowing }));
    },
    [dispatch, userData]
  );

  const isUserFollowedByMe = useCallback(
    (id) => {
      return userData?.following?.some((item) => item._id === id);
    },
    [userData]
  );

  const isProfileFollowedByMe = useMemo(() => {
    return isUserFollowedByMe(profileData?._id);
  }, [profileData, isUserFollowedByMe]);

  const referralLink = useMemo(() => {
    return profileData?.ref_code
      ? `${window.location.origin}/?ref=
    ${profileData?.ref_code}`
      : null;
  }, [profileData]);

  const referralLinkShareClickHandler = useCallback(() => {
    dispatch(
      openShareModal({
        text: `${profileData?.name} has shared a referral link with you.`,
        link: referralLink,
        linkName: `${profileData?.name}'s Referral Link`,
        modalTitle: "Share Referral Link",
      })
    );
  }, [referralLink, profileData, dispatch]);

  const followUserToggleHandler = useCallback(
    (isFollowed) => {
      const { _id } = profileData;
      setFollowProgress(true);
      const api = isFollowed ? () => unfollowUser(_id) : () => followUser(_id);

      apiHandler(api, {
        onSuccess: () => {
          updateAndDispatchUserFollowList(profileData, !isFollowed);
          setProfileData((prev) => {
            let newFollowers = [...prev.followers];
            const isFollower = newFollowers?.some(
              (item) => item?._id === userData?._id
            );
            if (isFollower) {
              newFollowers = newFollowers?.filter(
                (item) => item?._id !== userData?._id
              );
            } else {
              newFollowers = [...newFollowers, userData];
            }
            return {
              ...prev,
              followers: newFollowers,
            };
          });
        },
        onError: (error, response) => {
          const _error =
            typeof response?.data?.message === "string"
              ? response?.data?.message
              : error?.message;
          toast(_error, {
            type: error,
            position: "top-right",
          });
        },
        final: () => {
          setFollowProgress(false);
        },
      });
    },
    [updateAndDispatchUserFollowList, profileData, userData]
  );

  const followToggleHandler = useCallback(() => {
    if (isProfileFollowedByMe) {
      dispatch(
        openConfirmModal({
          onConfirm: () => followUserToggleHandler(isProfileFollowedByMe),
          title: "",
          prepend: (
            <Avatar
              style={{
                margin: "auto",
              }}
              $imgURL={profileData?.profile_image_url}
            />
          ),
          confirmLabel: "Unfollow",
          type: "delete",
          message: `Unfollow @${profileData?.username}?`,
        })
      );
    } else {
      followUserToggleHandler(isProfileFollowedByMe);
    }
  }, [dispatch, followUserToggleHandler, isProfileFollowedByMe, profileData]);

  useEffect(() => {
    if (props.sugesstedAcc?.length) {
      setSuggestAcc(props.sugesstedAcc);
    }
  }, [props]);
  const handleSuggest = () => {
    apiHandler(
      () => {
        return getSuggestAccount();
      },
      {
        onSuccess: (data) => {
          setSuggestAcc(data);
        },
      }
    );
  };

  useEffect(() => {
    setProfileData(props.profileData);
  }, [props.profileData]);

  const handleFollower = (name) => {
    setFollowerShow(true);
    setName(name);
  };

  const isMyProfile = useCallback(
    (user) => {
      return user?._id === userData?._id;
    },
    [userData]
  );

  const followListItemActionSuccessHandler = useCallback(
    (data, { followed } = {}) => {
      if (!Params?.id) {
        setProfileData((prev) => {
          let newFollowing = [...prev.following];
          if (followed) {
            newFollowing.push(data);
          } else {
            newFollowing = newFollowing.filter((item) => item._id !== data._id);
          }
          return {
            ...prev,
            following: newFollowing,
          };
        });
      }
      updateAndDispatchUserFollowList(data, followed);
    },
    [updateAndDispatchUserFollowList, Params]
  );

  return (
    <TopDiv>
      {followerShow ? (
        <Main>
          {" "}
          <div className="list-header">
            <button
              className="back-btn"
              onClick={() => {
                setFollowerShow(false);
              }}
            >
              <ArrowLeft onClick={handleSuggest} />
            </button>
            <h5 className="title">{name}</h5>
          </div>
          {name === "Followers" ? (
            <div className="users-list">
              {profileData?.followers?.map((value, i) => {
                return (
                  <FollowListItem
                    showAction={!isMyProfile(value)}
                    isFollowed={isUserFollowedByMe(value?._id)}
                    Key={`${value._id}-${i}`}
                    {...value}
                  />
                );
              })}
            </div>
          ) : (
            <div className="users-list">
              {profileData?.following.map((value, i) => {
                return (
                  <FollowListItem
                    key={`${value?._id}-${i}`}
                    showAction={!isMyProfile(value)}
                    onSuccess={followListItemActionSuccessHandler}
                    isFollowed={isUserFollowedByMe(value?._id)}
                    {...value}
                  />
                );
              })}
            </div>
          )}
        </Main>
      ) : (
        <>
          <Main>
            <div className="user-details-container">
              <Avatar
                $imgURL={profileData?.profile_image_url}
                className="user-avatar"
                $width={convertPxToRem(isMobile ? 80 : 110)}
                $height={convertPxToRem(isMobile ? 80 : 110)}
              />

              <div className="user-details">
                <p className="name">{profileData?.name}</p>
                <p className="username">{profileData?.username}</p>
                <div className="counts-wrap">
                  <div className="count-item">
                    <span className="count">
                      {profileData?.userAsset ? profileData?.userAsset : 0}
                    </span>
                    <span className="label">
                      {" "}
                      {getCountBasedText(profileData?.userAsset, "Post")}
                    </span>
                  </div>
                  <div
                    className="count-item interactive"
                    onClick={() => handleFollower("Followers")}
                  >
                    <span className="count">
                      {profileData?.followers?.length}
                    </span>
                    <span className="label">
                      {getCountBasedText(
                        profileData?.followers?.length,
                        "Follower"
                      )}
                    </span>
                  </div>
                  <div
                    className="count-item interactive"
                    onClick={() => handleFollower("Following")}
                  >
                    <span className="count">
                      {profileData?.following?.length}
                    </span>
                    <span className="label">Following</span>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div
              style={{
                textAlign: "center",
                width: "100%",
              }}
            >
              {!isLoggedInProfile ? (
                <>
                  <CustomButton
                    color="gradient"
                    outline={isProfileFollowedByMe}
                    loading={isFollowInProgress}
                    disabled={isFollowInProgress}
                    className={`profile-follow-button ${
                      isProfileFollowedByMe ? "outline" : ""
                    }`}
                    onClick={followToggleHandler}
                  >
                    {isProfileFollowedByMe ? "Unfollow" : "follow"}
                  </CustomButton>
                  <hr />
                </>
              ) : (
                ""
              )}
            </div>
            {profileData?.bio && (
              <>
                <Para className="bio">
                  <EllipsedText
                    text={profileData?.bio}
                    maxLength={300}
                    showMoreButton
                  />
                </Para>

                <hr />
              </>
            )}
            <div className="social-username-list">
              {profileData?.tiktokUsername ? (
                <a
                  href={getTiktokProfileLink(profileData?.tiktokUsername)}
                  className="social-username"
                  rel="noreferrer"
                  target="_blank"
                >
                  <TiktokIcon className="social-username-icon" />
                  {profileData?.tiktokUsername}
                </a>
              ) : (
                ""
              )}
              {profileData?.twitterUsername ? (
                <a
                  href={getTwitterProfileLink(profileData.twitterUsername)}
                  rel="noreferrer"
                  target="_blank"
                  className="social-username"
                >
                  <TwitterIcon className="social-username-icon" />
                  {profileData?.twitterUsername}
                </a>
              ) : (
                ""
              )}
              {profileData?.youtubeUsername ? (
                <a
                  href={getYoutubeChannelLink(profileData?.youtubeChannelId)}
                  className="social-username"
                  rel="noreferrer"
                  target="_blank"
                >
                  <YoutubeIcon className="social-username-icon" />
                  {profileData?.youtubeUsername}
                </a>
              ) : (
                ""
              )}
              {profileData?.instagramUsername ? (
                <a
                  href={getInstagramProfileLink(profileData?.instagramUsername)}
                  className="social-username"
                  rel="noreferrer"
                  target="_blank"
                >
                  <InstagramIcon className="social-username-icon" />
                  {profileData?.instagramUsername}
                </a>
              ) : (
                ""
              )}
            </div>

            {isLoggedInProfile && referralLink ? (
              <div className="referral-link-container">
                <div className="referral-link-title">Referral Link</div>
                <div className="referral-link-wrap">
                  <div className="referral-link">{referralLink}</div>

                  <span
                    className="referral-share-icon-wrap"
                    onClick={referralLinkShareClickHandler}
                  >
                    <ShareIcon className="referral-share-icon" />
                  </span>
                </div>
              </div>
            ) : null}
          </Main>

          {!isLargeTablet && suggestAcc?.length ? (
            <FollowersWrap>
              <h5 className="list-title">Suggested Accounts</h5>
              <div className="followers-list">
                {suggestAcc?.map((value, i) => {
                  return (
                    <FollowListItem
                      showAction={true}
                      onSuccess={followListItemActionSuccessHandler}
                      isFollowed={isUserFollowedByMe(value?._id)}
                      key={`${value?._id}-${i}`}
                      {...value}
                    />
                  );
                })}
              </div>
            </FollowersWrap>
          ) : null}
        </>
      )}
    </TopDiv>
  );
}

export default ProfileDetailsCard;
