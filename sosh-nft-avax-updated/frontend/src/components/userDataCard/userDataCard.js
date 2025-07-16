import { Link } from "react-router-dom";
import {
  Main,
  HeadDiv,
  MainDesc,
  UserDiv,
  UserSpan,
  UserName,
  ProfileDesc,
  ButtonSec,
  SocialSec,
  AddressImag,
  AddressSec,
  ItemSec,
  Balance,
} from "./style";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/loginStore/actions";
import EllipsedText from "components/EllipsedText";
import TiktokIcon from "assets/icons/tiktokIcon";
import TwitterIcon from "assets/icons/twitterIcon";
import InstagramIcon from "assets/icons/instagramIcon";
import UserIcon from "assets/icons/userIcon";
import EditIcon from "assets/icons/editIcon";
import BrokenLinkIcon from "assets/icons/brokenLinkIcon";
import YoutubeIcon from "assets/icons/youtubIcon";
import Avatar from "components/Avatar/Avatar";
import Routes from "constants/routes";
import { useNavigate } from "react-router";

import { NavLink } from "react-bootstrap";
import { APP_SOCIAL_LINKS, SUPPORT_MAIL_ADDRESS } from "constants/appConstants";
import DeleteIcon from "assets/icons/deleteIcon";
import { toast } from "react-toastify";
import { deleteUser } from "services/userServices";
import { apiHandler } from "services/axios";
import { useCallback } from "react";
import { openConfirmModal } from "store/commonStore/actionCreator";

const SOCIAL_SITE_DATA = [
  {
    name: "Tiktok",
    link: APP_SOCIAL_LINKS.TIKTOK,
    icon: TiktokIcon,
  },
  {
    name: "X (Twitter)",
    link: APP_SOCIAL_LINKS.TWITTER,
    icon: TwitterIcon,
  },
  {
    name: "Instagram",
    link: APP_SOCIAL_LINKS.INSTAGRAM,
    icon: InstagramIcon,
  },
  {
    name: "Youtube",
    link: APP_SOCIAL_LINKS.YOUTUBE,
    icon: YoutubeIcon,
  },
];

function UserDataCard({ onItemClick, parent }) {
  const {
    userData,
    balance: { eth: ethBalance },
  } = useSelector((state) => state.user);
  const { address, isLogin } = useSelector((state) => state.login);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile_image_url = useSelector(
    (state) => state.user?.userData?.profile_image_url
  );

  const disconnect = () => {
    dispatch(
      logout(() => {
        linkClickHandler();
        navigate(Routes.home);
      })
    );
  };

  const linkClickHandler = () => {
    if (parent === "drawer") {
      onItemClick && onItemClick();
    }
  };

  const handleDeleteAccount = useCallback(() => {
    apiHandler(() => deleteUser(), {
      onSuccess: (data) => {
        toast("User Deleted Successfully", {
          position: "top-right",
          autoClose: 5000,
          type: "success",
        });
        dispatch(
          logout(() => {
            navigate(Routes.home);
          })
        );
      },
      onError: () => {
        toast("User Deletion failed", {
          position: "top-right",
          autoClose: 5000,
          type: "error",
        });
      },
    });
  }, [dispatch, navigate]);

  const confirmDelete = useCallback(() => {
    // setIsDeleting(true);
    dispatch(
      openConfirmModal({
        message: "Are you sure you want to delete this account?",
        confirmLabel: "Delete",
        type: "delete",
        onConfirm: () => handleDeleteAccount(),
        onCancel: () => {
          // setIsDeleting(false);
        },
      })
    );
  }, [handleDeleteAccount, dispatch]);

  return (
    // <div style={{ width: "100%" }}>
    <Main className="user-data-card">
      {" "}
      {isLogin && (
        <>
          <HeadDiv>
            <MainDesc>
              <Avatar $imgURL={profile_image_url} $size="x-small" />
              <UserDiv>
                <UserSpan>
                  <UserName>{userData?.name}</UserName>
                </UserSpan>
                <ProfileDesc> @{userData?.username}</ProfileDesc>
              </UserDiv>
            </MainDesc>
          </HeadDiv>
          <hr />
          <ButtonSec>
            <Link
              onClick={linkClickHandler}
              className="user-action"
              to="my-profile"
            >
              <UserIcon className="icon" />
              <p className="label">My Profile</p>
            </Link>
            <Link
              onClick={linkClickHandler}
              className="user-action"
              to="/edit-profile"
            >
              <EditIcon className="icon" />
              <p className="label">Edit Profile</p>
            </Link>

            {/* <Link   to="/edit-profile"> */}
            <div className="user-action">
              <DeleteIcon className="icon" />
              <p className="label" onClick={confirmDelete}>
                Delete Account
              </p>
            </div>
            {/* </Link> */}

            <span className="user-action" onClick={disconnect}>
              <BrokenLinkIcon className="icon" />
              <p className="label">Disconnect Wallet</p>
            </span>
          </ButtonSec>
          <hr />
          <AddressSec>
            <div>
              <AddressImag src="/address-img.png" />
            </div>
            <div>
              <Balance>{ethBalance}</Balance>
              <EllipsedText text={address} maxLength={20} />
            </div>
          </AddressSec>
          <hr />
        </>
      )}
      <div className="userdata-card-footer">
        <ItemSec className="site-links-wrap">
          <NavLink
            onClick={linkClickHandler}
            as={Link}
            to={Routes.termsOfService}
            className="link-item"
          >
            Terms of Service
          </NavLink>
          {/* <Link to="#" className="link-item">
            Staking pools
          </Link> */}
          <NavLink
            as={Link}
            onClick={linkClickHandler}
            to={Routes.privacyPolicy}
            className="link-item"
          >
            Privacy Policy
          </NavLink>
          <NavLink
            as={Link}
            onClick={linkClickHandler}
            to={Routes.disclaimer}
            className="link-item"
          >
            Disclaimers
          </NavLink>
          <NavLink
            as={Link}
            onClick={linkClickHandler}
            to={Routes.about}
            className="link-item"
          >
            Purchaser Creator Agreement
          </NavLink>
          <NavLink
            target="_blank"
            rel="noreferrer"
            onClick={linkClickHandler}
            href={`mailto:${SUPPORT_MAIL_ADDRESS}?subject=Support&body=Hi, I have a question about the site`}
            className="link-item"
          >
            Technical Support
          </NavLink>
        </ItemSec>
        <SocialSec className="social-icons-wrap">
          <div className="social-list">
            {SOCIAL_SITE_DATA.map(({ link, icon: Icon }) => {
              return (
                <NavLink
                  key={link}
                  target="_blank"
                  rel="noreferrer"
                  href={link}
                  onClick={linkClickHandler}
                  className="social-link"
                >
                  <Icon className="icon" />
                </NavLink>
              );
            })}
          </div>
        </SocialSec>
      </div>
    </Main>
    // </div>
  );
}

export default UserDataCard;
