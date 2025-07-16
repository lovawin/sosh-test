import React, { useEffect } from "react";

import { StyledSocialShareModal } from "./style";
import TelegramIcon from "assets/icons/telegramIcon";
import WhatsappIcon from "assets/icons/whatsappIcon";
import TwitterIcon from "assets/icons/twitterIcon";
import FacebookIcon from "assets/icons/facebookIcon";
import MailIcon from "assets/icons/mailIcon";
import CopyToClipboardWrapper from "components/CopyToClipboardWrapper";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import LinkedinIcon from "assets/icons/linkedinIcon";
import { useDispatch, useSelector } from "react-redux";
import { closeShareModal } from "store/commonStore/actionCreator";
import { useLocation } from "react-router";

function SocialShareModal() {
  const {
    shareData: {
      visibility,
      text: globalText,
      link: globalLink,
      longText: globalLongText,
      linkName: globalLinkName = "NFT Link",
      modalTitle: globalModalTitle = "Share NFT",
    },
  } = useSelector((state) => state.common);

  const [pageData, setPageData] = React.useState({
    text: "",
    longText: "",
    link: "",
    linkName: "",
    modalTitle: "Share NFT",
  });
  const { text, longText, link, modalTitle, linkName } = pageData;
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    setPageData({
      title: globalText ?? document.title,
      description:
        globalLongText ??
        document.querySelector('meta[name="description"]').content,
      link: globalLink ?? window?.location?.href,
      linkName: globalLinkName,
      modalTitle: globalModalTitle ?? "Share NFT",
    });
  }, [
    globalText,
    globalLongText,
    globalLink,
    location,
    globalLinkName,
    globalModalTitle,
  ]);

  const shareList = [
    {
      platform: "telegram",
      icon: TelegramIcon,
      shareWrapper: TelegramShareButton,
      title: text,
    },
    {
      platform: "whatsapp",
      icon: WhatsappIcon,
      shareWrapper: WhatsappShareButton,
      title: text,
    },
    {
      platform: "twitter",
      icon: TwitterIcon,
      shareWrapper: TwitterShareButton,
      title: text,
    },
    {
      platform: "facebook",
      icon: FacebookIcon,
      shareWrapper: FacebookShareButton,
      quote: text,
    },
    {
      platform: "Email",
      icon: MailIcon,
      shareWrapper: EmailShareButton,
      subject: text,
      body: longText,
      openShareDialogOnClick: true,
      onClick: () => {},
    },
    {
      platform: "linkedin",
      icon: LinkedinIcon,
      shareWrapper: LinkedinShareButton,
      title: text,
      summary: longText,
    },
  ];

  const closeHandler = () => {
    dispatch(closeShareModal());
  };

  return (
    <StyledSocialShareModal
      showCloseButton
      centered
      show={visibility}
      onHide={closeHandler}
      title={modalTitle}
    >
      <div className="share-wrapper">
        <div className="share-item-list">
          {shareList?.map(
            ({ shareWrapper: Wrapper, icon: Icon, platform, ...restProps }) => (
              <div key={platform} className="share-item-wrap">
                <Wrapper url={link} {...restProps}>
                  <span className="share-item">
                    <Icon className="social-icon" />
                  </span>
                </Wrapper>
              </div>
            )
          )}
        </div>

        <div className="link-area">
          <div className="link-wrap">
            <span className="label">{linkName}</span>
            <p className="link link-primary">{link}</p>
          </div>
          <div className="icon-wrap">
            <CopyToClipboardWrapper
              textToBeCopied={link}
              successMessage="link copied!"
              showCopyIcon
            />
          </div>
        </div>
      </div>
    </StyledSocialShareModal>
  );
}

export default SocialShareModal;
