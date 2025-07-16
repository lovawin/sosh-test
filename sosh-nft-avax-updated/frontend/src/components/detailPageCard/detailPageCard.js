import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { Main, ImgDiv, HeadDiv, StyledOwner } from "./style";

import { likeAsset, purchaseNft } from "services/assetsServices";
import { apiHandler } from "services/axios";
import { Link } from "react-router-dom";

import EllipsedText from "components/EllipsedText";
import LikeButton from "components/likeButton";
import ShareButton from "components/shareButton";

import Avatar from "components/Avatar/Avatar";

import { Button, Nav, Tab } from "react-bootstrap";
import HashTag from "components/hashTag/hashTag";
import UserChip from "components/userChip/userChip";
import CommentSection from "./components/commentSection/commentSection";
import useMediaQuery from "hooks/useMediaQuery";
import { deviceQuery } from "styles/mediaSizes";
import { CUSTOM_TOKEN_ADDRESS_721 } from "common/config721";
import CopyToClipboardWrapper from "components/CopyToClipboardWrapper";
import CustomButton from "components/CustomButton";
import ModalBuyNFT from "components/ModalPlaceBidNFT/ModalBuyNFT";
import CountdownTimer from "components/dynamicTimer/Timer";
import { setLoading, unSetLoading } from "store/Actions/data";
import { buyNFT, finalizeBid } from "common/helpers/nftMarketPlaceFunctions";
import { ethers } from "ethers";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";
import getConfig from "configs/config";

const ASSET_TABS_DATA = {
  comment: {
    title: "Comments",
    key: "comment",
  },
  ownership: {
    title: "Ownership",
    key: "ownership",
  },
  additionalInfo: {
    title: "Additional Info",
    key: "additionalInfo",
  },
};

const ASSET_TABS_DATA_ARRAY = Object.values(ASSET_TABS_DATA);

function DetailPageCard({ data, auctionData }) {
  const isLogin = useSelector((state) => state.login.isLogin);
  const [isSaleDisabled, setIsSaleDisabled] = useState(false);
  const [isFinalize, setIsFinalized] = useState(false);

  const isUpdate = useSelector((state) => state.data.isUpdate);

  const [showModal, setShowModal] = useState(false);
  const [propData, setPropData] = useState(data?.askPrice ?? 0);

  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [details, setDetails] = useState(data);
  const { address } = useSelector((state) => state.login);

  const [isLikeUpdating, setIsLikeUpdating] = useState(false);
  const isTablet = useMediaQuery(deviceQuery.tablet);
  console.log("data from detail", data);
  console.log('details', details)

    const handleFinalizeBid = async () => {
      try {
        console.log("works");
        dispatch(setLoading());

        let res = await finalizeBid(data?.saleId, address);
        if (res) {
          const txHash = {
            hash: res?.transactionHash,
          };
          console.log("txHash", txHash);
          purchaseNftMutation(txHash?.hash);
        }

        // onProceed(amount);
      } catch (error) {
        // setError("Transaction failed");
        console.error("Error:", error);
        dispatch(unSetLoading());
      }
    };

  const purchaseNftMutation = useCallback((txHash) => {
    console.log("txHash", txHash);
    apiHandler(() => purchaseNft(txHash), {
      onSuccess: async (res) => {
        console.log("res from pruchase", await res);
        dispatch(unSetLoading());
        // onLikeToggle && onLikeToggle(id);
      },
      onError: (error) => {
        console.log("error", error);
        dispatch(unSetLoading());

        toast("Error while Buying", {
          position: "top-right",
          type: "error",
        });
      },
      final: () => {},
    });
  }, []);

  const handleProceed = async (saleId, price) => {
    try {
      dispatch(setLoading());

      let res = await buyNFT(saleId, price, address);
      console.log("res from buy handleProcedd", res);

      if (res) {
        const txHash = {
          hash: res?.transactionHash,
        };
        purchaseNftMutation(txHash?.hash);
      }
    } catch (error) {
      console.error("Error:", error);
      dispatch(unSetLoading());
    }
  };

  const handleBuyClick = () => {
    if (!isLogin) {
      toast("Please Connect Wallet", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    setShowModal(true);
  };

  const [isTrue, setIsTrue] = useState(false);

  const handleClose = () => setShowModal(false);
  const startLikeUpdate = useCallback(() => {
    setIsLikeUpdating(true);
  }, []);

  const stopLikeUpdate = useCallback(() => {
    setIsLikeUpdating(false);
  }, []);

  const isOwner = userData?._id === data?.owner_id?._id;

  const likeAndDislikeAsset = () => {
    if (!isLogin) {
      toast("Please Connect Wallet", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return true;
    }
    startLikeUpdate();
    apiHandler(() => likeAsset(details?._id, !details?.liked), {
      onSuccess: (data) => {
        setDetails((prevState) => {
          return {
            ...prevState,
            liked: !prevState.liked,
            likedBy: !prevState.liked
              ? [...prevState.likedBy, userData]
              : prevState.likedBy.filter(({ _id }) => _id !== userData._id),
          };
        });
      },
      onError: () => {
        toast("Failed to like NFT", {
          position: "top-right",
          autoClose: 5000,
          type: "error",
        });
      },
      final: () => {
        stopLikeUpdate();
      },
    });
  };

  useEffect(() => {
    if (data) {
      setDetails(data);
    }
  }, [data]);
  useEffect(() => {
    const now = new Date().getTime();
    const start = new Date(data?.startTime * 1000).getTime();
    const end = new Date(data?.endTime * 1000).getTime();
    if (now < start) {
      console.log("saleDisabled now < start", now < start);
      setIsSaleDisabled(true);
    } else if (now > end) {
      console.log("saleDisabled now < start", now > end);

      setIsSaleDisabled(true);
      setIsFinalized(true);
    } else {
      setIsSaleDisabled(false);
    }
  }, [data?.endTime, data?.startTime]);

  console.log("data from detail Page card", data);

  return (
    <>
      {isUpdate && <LoadingBubbleCircle />}
      <HeadDiv>
        <Main>
          <ImgDiv>
            <Link
              className="profle-link"
              to={`/user-profile/${details?.owner_id?._id}`}
            >
              <Avatar
                $size={isTablet ? "medium" : "large"}
                $imgURL={details?.owner_id?.profile_image_url}
              />

              <h5 className="owner-name">{details?.owner_id?.name}</h5>
              <p className="owner-username">@{details?.owner_id?.username}</p>
            </Link>
          </ImgDiv>
          <div className="nft-details-wrap">
            <h1 className="nft-title">{details?.name}</h1>
            <span className="nft-description">
              <EllipsedText
                text={details?.description}
                maxLength={300}
                showMoreButton
              />
            </span>
            <div className="nft-hashtags">
              {<HashTag bold tag={details?.hashtag} />}
            </div>
          </div>
          {/* <div>
            <span style={{ fontSize: "15px", color: "#1F6781" }}>
              Multipal{" "}
            </span>
            <span style={{ fontSize: "15px", fontWeight: "600" }}>
              copies|owners
            </span>
          </div> */}

          <>
            <div>
              {/* <div style={{ fontSize: 20, marginTop: 20 }}>
                  Sale ends 25 June 2024 at 10:47 pm
                </div> */}

              <div
                className="countdown-container"
                style={{ display: "flex", gap: 10 }}
              >
                <CountdownTimer
                  startTime={Number(data?.startTime)}
                  endTime={Number(data?.endTime)}
                />
              </div>
            </div>
            <div style={{ marginTop: "20px" }}>
              {data?.subtype ? (
                data?.subtype === "fixed" ? (
                  <CustomButton
                    className="home-buy-button"
                    $width="27%"
                    color="gradient"
                    onClick={() => {
                      handleProceed(data?.saleId, data?.askPrice);
                    }}
                    disabled={isLikeUpdating || isSaleDisabled}
                  >
                    Buy
                  </CustomButton>
                ) : !isFinalize ? (
                  <CustomButton
                    className="home-buy-button"
                    $width="27%"
                    color="gradient"
                    onClick={handleBuyClick}
                    disabled={isLikeUpdating || isSaleDisabled}
                  >
                    Bid
                  </CustomButton>
                ) : (
                  <CustomButton
                    className="home-buy-button"
                    $width="27%"
                    color="gradient"
                    onClick={handleFinalizeBid}
                    // disabled={isLikeUpdating || isSaleDisabled}
                  >
                    Finalize
                  </CustomButton>
                )
              ) : null}
            </div>
          </>

          <div className="actions-wrapper">
            <LikeButton
              isLiked={details?.liked}
              loading={isLikeUpdating}
              disabled={isLikeUpdating}
              count={details?.likedBy?.length}
              onClick={likeAndDislikeAsset}
            />

            <ShareButton />
          </div>
        </Main>
        <Main className="mt-3">
          <Tab.Container defaultActiveKey={ASSET_TABS_DATA?.comment.key}>
            <Nav className="tab-list">
              {ASSET_TABS_DATA_ARRAY?.map(
                ({ title, key, type, icon: Icon }, i) => {
                  return (
                    <Nav.Item key={`${key}-${i}`} className="tab-item">
                      <Nav.Link className="tab-link" eventKey={key}>
                        {title}
                      </Nav.Link>
                    </Nav.Item>
                  );
                }
              )}
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey={ASSET_TABS_DATA.comment.key}>
                <div className="tab-data">
                  <CommentSection
                    assetId={details?._id}
                    initialComments={details?.comments?.result}
                    totalComments={details?.comments?.pagination?.total}
                  />
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey={ASSET_TABS_DATA.ownership.key}>
                <div className="tab-data">
                  <div className="owner-wrap">
                    <StyledOwner>
                      <UserChip {...details?.owner_id} />
                    </StyledOwner>
                  </div>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey={ASSET_TABS_DATA.additionalInfo.key}>
                <div className="tab-data">
                  {" "}
                  <div className="additional">
                    <div className="additional-info">
                      <div className="head">Contract address</div>
                      <div className="desc">
                        <CopyToClipboardWrapper
                          showCopyIcon
                          textToBeCopied={CUSTOM_TOKEN_ADDRESS_721}
                        >
                          <EllipsedText
                            text={CUSTOM_TOKEN_ADDRESS_721}
                            maxLength={20}
                            ellipsePosition="middle"
                          />
                        </CopyToClipboardWrapper>
                      </div>
                      {/* <div>{details?.owner_id?.wallet_address}</div> */}
                    </div>
                    <div className="additional-info">
                      <div className="head">Token ID</div>
                      <div className="desc">{details?.token_id}</div>
                    </div>
                    {/* <div className="additional-info">
                      <div className="head">Blockchain</div>
                      <div className="desc">Ethereum Blockchain</div>
                    </div> */}
                    <div className="additional-info">
                      <div className="head">Post Link</div>
                      <div className="desc">
                        <a
                          className="ellipsed"
                          target="_blank"
                          rel="noreferrer"
                          href={details?.post_url}
                        >
                          {details?.post_url}
                        </a>{" "}
                      </div>
                    </div>
                    <div className="additional-info">
                      <div className="head">Explorer Link</div>
                      <div className="desc">
                        <a
                          className="ellipsed"
                          target="_blank"
                          rel="noreferrer"
                          href={`${getConfig()?.sepoliaHashUrl}${details?.mint_tx_hash}`}
                        >
                          {`${getConfig()?.sepoliaHashUrl}${details?.mint_tx_hash}`}
                        </a>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Main>
      </HeadDiv>
      <ModalBuyNFT
        actionType={data?.subtype === "fixed" ? "buy" : "bid"}
        showModal={showModal}
        auctionData={auctionData}
        handleClose={handleClose}
        setShowModal={setShowModal}
        saleId={data?.saleId}
        askPrice={ethers?.utils?.formatEther(propData)}
      />
    </>
  );
}

export default DetailPageCard;

DetailPageCard.propTypes = {
  data: PropTypes.object,
  onNextComments: PropTypes.func,
  hasMoreComments: PropTypes.bool,
  loading: PropTypes.bool,
  totalComments: PropTypes.number,
};
